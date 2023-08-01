// ######################################################################
// ## Lonely Lobster API definitions 
// ######################################################################

// to-do: share these definitions as project references wth backend and frontend
// see: https://wallis.dev/blog/typescript-project-references

export type Effort         = number // measured in Worker Time Units
export type Value          = number // measured in Worker Time Units
export type ValueChainId   = string
export type ProcessStepId  = string
type WorkItemId     = number
type WorkItemTag    = [string, string]
export type WorkerName     = string
type TimeStamp      = number
export type RgbColor       = [number, number, number]

export type WorkerWithUtilization = {
    worker:                         WorkerName,
    utilization:                    number
}

export type PsWorkerUtilization = WorkerWithUtilization & {
/*
    worker:                         WorkerName,
    utilization:                    number
*/
    assignedProcessSteps:           ProcessStepId[]
}
  
export interface VcExtended {
    vc:         I_ValueChain
    wosUtil:    PsWorkerUtilization[]
    flowStats?: I_ValueChainStatistics
}  

export interface ObExtended {
    ob: I_OutputBasket
    flowStats?: I_WorkItemStatistics
}




export interface PsExtended {
    ps:         I_ProcessStep
    wosUtil:    WorkerWithUtilization[]
    flowStats?: I_ProcessStepStatistics
}  



  // request to iterate

export interface I_IterationRequest {
    time: number
    newWorkOrders: {
        valueChainId:ValueChainId 
        numWorkOrders: number
    }[]
}

// response on "iterate" request
    export interface I_WorkItem {
    id:                             WorkItemId
    tag:                            WorkItemTag
    rgbColor?:                      RgbColor         // not assigned at backend but by the frontend after having received system-state data
    valueChainId:                   ValueChainId
    value:                          Value
    maxEffort:                      Effort
    processStepId:                  ProcessStepId
    accumulatedEffort:              number // ... in process step or overall when in the Output basket
    elapsedTime:                    number // ... in process step or overall when in the Output basket
}

export interface I_ProcessStep {
    id:                             ProcessStepId
    normEffort:                     Effort
    workItems:                      I_WorkItem[]
    workItemFlow:                   number
}

export interface I_ValueChain {
    id:                             ValueChainId
    totalValueAdd:                  Value
    processSteps:                   I_ProcessStep[]
}

/*
export interface I_EndProduct {
    id:                             WorkItemId
    tag:                            WorkItemTag
    accumulatedEffortInValueChain:  number
    valueOfValueChain:              Value
    elapsedTimeInValueChain:        number
}
*/
export interface I_OutputBasket {
//  workItems:                      I_EndProduct[]
    workItems:                      I_WorkItem[]
}

export interface I_ValueChainProcessStep {
    valueChain:  ValueChainId,
    processStep: ProcessStepId
}
export interface I_WorkerState {
    worker:                         WorkerName
    utilization:                    number
//  assignmentsInfo:                string
    assignments:                    I_ValueChainProcessStep[]
}

export interface I_SystemState {
    id:                             string,
    time:                           TimeStamp,
    valueChains:                    I_ValueChain[]
    outputBasket:                   I_OutputBasket
    workersState:                   I_WorkerState[]
}

// response to statistics request

interface WorkItemStatsCycleTime {
    min: number,
    avg: number,
    max: number
}

interface WorkItemStatsThroughput {
    itemsPerTimeUnit:    number,
    valuePerTimeUnit:    number
}

export interface I_WorkItemStatistics {
    hasCalculatedStats: boolean,
    throughput:         WorkItemStatsThroughput,
    cycleTime:          WorkItemStatsCycleTime
}

export interface I_ProcessStepStatistics {
    id: string
    stats: I_WorkItemStatistics
//  accumulatedEffort: Effort
} 

export interface I_ValueChainStatistics {
    id: ValueChainId
    stats: {
        vc:  I_WorkItemStatistics,
        pss: I_ProcessStepStatistics[]
    }
} 

/*
export interface I_SystemStatistics {
    outputBasket: I_WorkItemStatistics
    valueChains:  I_ValueChainStatistics[]
    workingCapital: Effort
}
*/

export interface I_InventoryStatistics {
    wibhId:          string // ## special type instead?
    numWis:         number
    valueWisNet:    Value
    valueWisDegratedOverTime: Value
}

export interface I_OutputBasketStatistics {
    flow: I_WorkItemStatistics
    inventory: I_InventoryStatistics
}

export interface I_SystemStatistics {
    outputBasket: I_OutputBasketStatistics
    valueChains:  I_ValueChainStatistics[]
    workingCapital: Effort
}

