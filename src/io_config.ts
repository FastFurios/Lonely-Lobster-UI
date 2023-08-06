// ------------------------------------------------------------
//  read system configuration from JSON file
// ------------------------------------------------------------

import { readFileSync } from "fs"
import { debugShowOptions } from "./_main.js"
import { SortVector, SelectionCriterion } from "./helpers.js"
import { LonelyLobsterSystem } from "./system.js"
import { ValueChain } from './valuechain.js'
import { Worker, AssignmentSet, Assignment } from './worker.js'
import { WiExtInfoElem } from './workitem.js'
import { ProcessStep } from "./workitembasketholder.js"
//?? 7.4. import { I_SystemState, I_ValueChain, I_ProcessStep, I_WorkItem, I_OutputBasket, I_WorkerState } from './io_api_definitions.js'

export interface DebugShowOptions  {
    clock:          boolean,
    workerChoices:  boolean,
    readFiles:      boolean
}


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

    const paj: any = JSON.parse(paramsAsString)  // "paj" = parameters as JSON 
    return systemCreatedFromConfigJson(paj)
}

// -----------------------------------------------------------------------------------------------------------
// Create system from JSON config object
// -----------------------------------------------------------------------------------------------------------

export function systemCreatedFromConfigJson(paj: any) : LonelyLobsterSystem {
    // extract system id
    const systemId: string = paj.system_id

    // extract value chains
    interface I_process_step {
        process_step_id: string
        norm_effort:     number
        bar_length:      number
    } 
    interface I_value_chain {
        value_chain_id: string
        value_add:      number,
        injection_throughput?: number,
        value_degration_per_time_unit?: number,
        process_steps:  I_process_step[]  
    }

    const newProcessStep         = (psj:  I_process_step, vc: ValueChain)   : ProcessStep   => new ProcessStep(psj.process_step_id, vc, psj.norm_effort, psj.bar_length)
    const newEmptyValueChain     = (vcj:  I_value_chain)                    : ValueChain    => new ValueChain(vcj.value_chain_id, vcj.value_add, vcj.injection_throughput, vcj.value_degration_per_time_unit)
    const addProcStepsToValChain = (pssj: I_process_step[], vc: ValueChain) : void          => pssj.forEach(psj => vc.processSteps.push(newProcessStep(psj, vc))) 
    const filledValueChain       = (vcj:  I_value_chain)                    : ValueChain    => {
        const newVc: ValueChain = newEmptyValueChain(vcj)
        addProcStepsToValChain(vcj.process_steps, newVc)
        return newVc
    }
    const valueChains: ValueChain[] = paj.value_chains.map((vcj: I_value_chain) => filledValueChain(vcj))

    // extract workers and assignments
    interface I_process_step_assignment {
        value_chain_id:     string
        process_steps_id:   string
    }
    interface I_worker {
        worker_id:                                  string
        select_next_work_item_sort_vector_sequence: I_SortVector[]
        process_step_assignments:                   I_process_step_assignment[]
    }
    interface I_SortVector {
        measure:             WiExtInfoElem
        selection_criterion: SelectionCriterion
    }
    
    const createdNewWorker = (woj: I_worker): Worker => { 
        const sortVectorFromJson = (svj: I_SortVector): SortVector => {
            return {
                colIndex: Object.getOwnPropertyDescriptor(WiExtInfoElem, svj.measure)?.value,
                selCrit:  Object.getOwnPropertyDescriptor(SelectionCriterion, svj.selection_criterion)?.value
            } 
        }
        const svs: SortVector[] = woj.select_next_work_item_sort_vector_sequence == undefined 
                                ? [] 
                                : woj.select_next_work_item_sort_vector_sequence?.map(svj => sortVectorFromJson(svj))
        return new Worker(woj.worker_id, svs) 
    }

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
        const newWorker: Worker = createdNewWorker(woj)
        workers.push(newWorker)
        woj.process_step_assignments.forEach(psaj => addWorkerAssignment(psaj, newWorker, valueChains, asSet))
    }
 
    const workers: Worker[] = [] 
    const asSet:   AssignmentSet = new AssignmentSet("default")
    paj.workers.forEach((woj: I_worker) => createAndAssignWorker(woj, workers, valueChains, asSet))
    
    if (paj.debug_show_options != undefined) {
        debugShowOptions.clock          = paj.debug_show_options.clock
        debugShowOptions.workerChoices  = paj.debug_show_options.worker_choices
        debugShowOptions.readFiles      = paj.debug_show_options.read_files
    }

    // return the configured system
    return new LonelyLobsterSystem(systemId, valueChains, workers, asSet)
} 

