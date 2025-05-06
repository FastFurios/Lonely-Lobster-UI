//-------------------------------------------------------------------
// FRONTEND TYPE DEFINITIONS 
//-------------------------------------------------------------------
// last code cleaning: 24.12.2024

import { I_WeightedSelectionStrategy, I_WorkItemEvent, WorkerName, ProcessStepId, I_ValueChain, I_ValueChainStatistics, I_OutputBasket, I_ProcessStep, I_WorkItemStatistics, ValueChainId, I_ProcessStepStatistics } from "./io_api_definitions"
/**
 * All additional relevant type definitions shared between frontend components and/or services not already defined in io_api-definition.ts.
 */

// -----------------------------------------------------------
/** Basic types */
// -----------------------------------------------------------

/** The discrete unit the time progresses in Lonely Lobster: 0, 1, 2 ... */
/** The discrete duration between 2 timestamps */
export type TimeInterval   = number // frontend

// -----------------------------------------------------------
/** Backend response on "iterate" request */ 
// -----------------------------------------------------------

/** weighted strategy with its display color; used in frontend only */
export type ColoredWeightedSelectionStrategy = I_WeightedSelectionStrategy & {
    backgroundColor: string // string with css color codes 
}
  
// -----------------------------------------------------------
/** response to system statistics request */
// -----------------------------------------------------------

/** used in frontend only */
export interface I_FlowStats { // frontend
    tpv: number,  // throughput measured in value
    tpi: number,  // throughput measured in #items
    ct:  number   // cycle time
}

// -----------------------------------------------------------
/** workitem event retrieval (for export for external statistical analysis) */
// -----------------------------------------------------------

export type I_WorkItemEvents = I_WorkItemEvent[]  // frontend 

// -----------------------------------------------------------
/** worker utilization */
// -----------------------------------------------------------

/** worker and its utilization as percentage */
export type WorkerWithUtilization = {  // frontend
    worker:                         WorkerName,
    utilization:                    number
}

/** worker utilization and the process steps he/she works on */
export type PsWorkerUtilization = WorkerWithUtilization & {  // frontend
    assignedProcessSteps:           ProcessStepId[]
}
      
/** all values for displaying a value chain in the frontend */
export interface VcExtended {
    vc:         I_ValueChain
    wosUtil:    PsWorkerUtilization[]
    flowStats?: I_ValueChainStatistics
}  

/** all values for displaying the output basket in the frontend */
export interface ObExtended {
    ob: I_OutputBasket
    flowStats?: I_WorkItemStatistics
}

/** all values for displaying a process step in the frontend */
export interface PsExtended {
    ps:         I_ProcessStep
    vcId:       ValueChainId
    wosUtil:    WorkerWithUtilization[]
    flowStats?: I_ProcessStepStatistics
}  

// -----------------------------------------------------------
/** types and value lists for the editor */ 
// -----------------------------------------------------------

/** work item measurement kpis */ 
export enum workItemSelectionStrategyMeasureNames { // frontend
    accumulatedEffortInProcessStep  = "accumulated effort in process step",
    remainingEffortInProcessStep    = "remaining effort in process step",
    accumulatedEffortInValueChain   = "accumulated effort in value chain",
    remainingEffortInValueChain     = "remaining effort in value chain",

    visitedProcessSteps             = "visited process steps",
    remainingProcessSteps           = "remaining process steps",

    valueOfValueChain               = "value-add of value chain",
    totalEffortInValueChain         = "total effort in value chain",
    contributionOfValueChain        = "contribution of value chain",

    sizeOfInventoryInProcessStep    = "size of inventory in process step",

    elapsedTimeInProcessStep        = "elapsed time in process step",
    elapsedTimeInValueChain         = "elapsed time in value chain"
}

export const selectionCriterionNames = [ // for workItemSelectionStrategyMeasureNames in the frontend
    "maximum",
    "minimum"
]