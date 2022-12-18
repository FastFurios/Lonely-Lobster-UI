import * as fs from "fs"  // wohl doch nicht: braucht vorher: $npm install --save @types/node
import { LonelyLobsterSystem } from "./system.js"
import { ValueChain } from './valuechain.js'
import { Worker, selectNextWorkItem_001, AssignmentSet, Assignment } from './worker.js'
import { ProcessStep } from "./workitembasketholder.js"

// #### read system configuration from JSON file ###################################################################################

export function systemCreatedFromConfigFile(filename : string) : LonelyLobsterSystem {

    // read system parameter JSON file
    let paramsAsString : string = ""
    try { paramsAsString  = fs.readFileSync(filename, "utf8") } 
    catch (e: any) {
        switch (e.code) {
            case "ENOENT" : { throw new Error("System parameter file not found: " + e) }
            default       : { throw new Error("System parameter file: other error: " + e.message) }
            //case "ENOENT" : { console.log("System parameter file not found: " + e); throw new Error() }
            //default       : { console.log("System parameter file: other error: " + e.message); throw new Error() }
        }   
    } 
    finally {}

    const paj = JSON.parse(paramsAsString)  // "paj" = parameters as JSON 

    // extract system id
    const systemId: string = paj.system_id

    // extract value chains
    interface I_process_step {
        process_step_id: string,
        norm_effort:     number
    } 
    
    interface I_value_chain {
        value_chain_id: string,
        value_add:      number,
        process_steps:  I_process_step[]  
    }

    const createProcessStep      = (psj:  I_process_step, vc: ValueChain)   : ProcessStep   => new ProcessStep(psj.process_step_id, vc, psj.norm_effort)
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

    const createNewWorker = (woj: I_worker): Worker => new Worker(woj.worker_id, selectNextWorkItem_001) 
    const addWorkerAssignment = (psaj: I_process_step_assignment, newWorker: Worker, vcs: ValueChain[], asSet: AssignmentSet): void  => {
        const mayBeVc = vcs.find(vc => vc.id == psaj.value_chain_id)
        if (mayBeVc == undefined) { console.log(`Reading system parameters: try to assign worker=${newWorker} to value chain=${psaj.value_chain_id}: could not find value chain`); throw new Error() }
        const vc: ValueChain = mayBeVc

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
 
    const workers:      Worker[]      = [] 
    const asSet:  AssignmentSet = new AssignmentSet("default")
    paj.workers.forEach((woj: I_worker) => createAndAssignWorker(woj, workers, valueChains, asSet))
    
    // return the system
    return new LonelyLobsterSystem(systemId, valueChains, workers, asSet)
} 