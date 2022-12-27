import { createReadStream, readFileSync } from "fs"
import { Interface, createInterface } from "readline"
import { Timestamp } from "./clock.js"
import { LonelyLobsterSystem } from "./system.js"
import { ValueChain } from './valuechain.js'
import { ProcessStep } from "./workitembasketholder.js"
import { WorkOrder } from './workitem.js'
import { Worker, selectNextWorkItem_002, AssignmentSet, Assignment } from './worker.js'

// ------------------------------------------------------------
//  nice little helper functions
// ------------------------------------------------------------

// --- create 2-tuples from two arrays
type Tuple<T, U> = [T, U]

function tupleBuilderFrom2Arrays<T, U>(a: T[], b: U[]): Tuple<T, U>[] {
    let tupleArray: Tuple<T, U>[] = []
    for (let i=0; i < Math.min(a.length, b.length); i++) tupleArray.push([a[i], b[i]]) 
    return tupleArray
}

// --- create array with n times an item
const duplicate = <T>(item: T, n: number): T[] => Array.from({length: n}).map(e => item)

// --- split an array at an index
interface SplitArray<T> {
    head:   T[] 
    middle: T
    tail:   T[]
}
export function reshuffle<T>(a: T[]): T[] {
    if (a.length == 0) return []
    const splitIndex = Math.floor(Math.random() * a.length)
    const sa: SplitArray<T> = split(a, splitIndex)
    return [a[splitIndex]].concat(reshuffle<T>(sa.head.concat(sa.tail)))
}

function split<T>(a: T[], splitIndex: number): SplitArray<T>  {
   return { head: a.slice(undefined, splitIndex),
            middle: a[splitIndex],
            tail: a.slice(splitIndex + 1, undefined)
          }
}


// ------------------------------------------------------------
//  read system configuration from JSON file
// ------------------------------------------------------------

export function systemCreatedFromConfigFile(filename : string) : LonelyLobsterSystem {

    // read system parameter JSON file
    let paramsAsString : string = ""
    try { paramsAsString  = readFileSync(filename, "utf8") } 
    catch (e: any) {
        switch (e.code) {
            case "ENOENT" : { throw new Error("System parameter file not found: " + e) }
            default       : { throw new Error("System parameter file: other error: " + e.message) }
        }   
    } 
    finally {}

    const paj = JSON.parse(paramsAsString)  // "paj" = parameters as JSON 

    // extract system id
    const systemId: string = paj.system_id

    // extract value chains
    interface I_process_step {
        process_step_id: string,
        norm_effort:     number,
        bar_length:      number
    } 
    interface I_value_chain {
        value_chain_id: string,
        value_add:      number,
        process_steps:  I_process_step[]  
    }

    const createProcessStep      = (psj:  I_process_step, vc: ValueChain)   : ProcessStep   => new ProcessStep(psj.process_step_id, vc, psj.norm_effort, psj.bar_length)
    const createEmptyValueChain  = (vcj:  I_value_chain)                    : ValueChain    => new ValueChain(vcj.value_chain_id, vcj.value_add)
    const addProcStepsToValChain = (pssj: I_process_step[], vc: ValueChain) : void          => pssj.forEach(psj => vc.processSteps.push(createProcessStep(psj, vc))) 
    const createFilledValueChain = (vcj:  I_value_chain)                    : ValueChain    => {
        const newVc: ValueChain = createEmptyValueChain(vcj)
        addProcStepsToValChain(vcj.process_steps, newVc)
        return newVc
    }
    const valueChains: ValueChain[] = paj.value_chains.map((vcj: I_value_chain) => createFilledValueChain(vcj))

    // extract workers and assignments
    interface I_process_step_assignment {
        value_chain_id      : string,
        process_steps_id    : string
    }
    interface I_worker {
        worker_id: string,
        process_step_assignments: I_process_step_assignment[]
    }

    const createNewWorker     = (woj: I_worker): Worker => new Worker(woj.worker_id, selectNextWorkItem_002) 
    const addWorkerAssignment = (psaj: I_process_step_assignment, newWorker: Worker, vcs: ValueChain[], asSet: AssignmentSet): void  => {
        const mayBeVc = vcs.find(vc => vc.id == psaj.value_chain_id)
        if (mayBeVc == undefined) { console.log(`Reading system parameters: try to assign worker=${newWorker} to value chain=${psaj.value_chain_id}: could not find value chain`); throw new Error() }
        const vc: ValueChain  = mayBeVc

        const mayBePs = vc.processSteps.find(ps => ps.id == psaj.process_steps_id)
        if (mayBePs == undefined) { console.log(`Reading system parameters: try to assign worker=${newWorker} to process step ${psaj.process_steps_id} in value chain=${psaj.value_chain_id}: could not find process step`); throw new Error() }
        const ps: ProcessStep = mayBePs

        const newAssignment: Assignment =  { worker:                 newWorker,            
                                             valueChainProcessStep:  { valueChain:  vc, 
                                                                       processStep: ps }}
        asSet.assignments.push(newAssignment)
    }

    const createAndAssignWorker = (woj: I_worker, workers: Worker[], valueChains: ValueChain[], asSet: AssignmentSet): void => { 
        const newWorker: Worker = createNewWorker(woj)
        workers.push(newWorker)

        woj.process_step_assignments.forEach(psaj => addWorkerAssignment(psaj, newWorker, valueChains, asSet))
    }
 
    const workers: Worker[] = [] 
    const asSet:   AssignmentSet = new AssignmentSet("default")
    paj.workers.forEach((woj: I_worker) => createAndAssignWorker(woj, workers, valueChains, asSet))
    
    // return the system
    return new LonelyLobsterSystem(systemId, valueChains, workers, asSet)
} 

// ------------------------------------------------------------
//  read work order inflow csv file and feed it to the LonelyLobster system
// ------------------------------------------------------------

type MaybeValueChain = ValueChain | undefined

interface CsvTableProcessorResult {
    time?:       Timestamp,
    workOrders: WorkOrder[] 
}

class CsvTableProcessor {
    headers: MaybeValueChain[] = []
    constructor(private sys: LonelyLobsterSystem) { }
 
    public workOrdersFromLine(line: string): CsvTableProcessorResult {
        if (line.substring(0, 2) == "//") 
            return { workOrders: [] }  // ignore
        if (line.substring(0, 2) == "##") { 
            this.headers =   line
                            .split(";")
                            .slice(1)
                            .map(s => this.sys.valueChains.find(vc => vc.id == s.trim()))
            return { workOrders: [] }  // ignore
        }
        if (line.substring(0, 2) == "??") { 
            this.sys.showFooter()
            return { workOrders: [] }  // ignore
        }
        if (this.headers.length == 0) throw Error("Reading csv-file for incoming work orders: values line w/o having read header line before")
        const timeAndnumWoPerVC: number[] = line  // timestamp and then number of work orders per value chain
                                           .split(";")
                                           .map(s => parseInt(s.trim()))
        const timestamp:  Timestamp = timeAndnumWoPerVC[0]
        const numWoPerVc: number[]  = timeAndnumWoPerVC.slice(1)

        const vcNumTplArr: Tuple<MaybeValueChain, number>[] = tupleBuilderFrom2Arrays(this.headers, numWoPerVc)

        const wosFromLine: WorkOrder[] = vcNumTplArr.flatMap(tpl => duplicate<WorkOrder>( { timestamp: timestamp, valueChain: <ValueChain>tpl[0] }, tpl[1]  ))
        return { time: timestamp, workOrders: wosFromLine }
    }
}

export function processWorkOrderFile(filename : string,sys: LonelyLobsterSystem): void {
    const ctp = new CsvTableProcessor(sys)

    function processWorkOrdersFromLine(line: string): void {
        const { time, workOrders } = ctp.workOrdersFromLine(line)
        if (time != undefined) sys.doNextIteration(time, workOrders)
    }

    const fileReaderConfig      = { input: createReadStream(filename), terminal: false }
    const lineReader: Interface = createInterface(fileReaderConfig)

    sys.showHeader()
    lineReader.on("line", line => processWorkOrdersFromLine(line))
}

