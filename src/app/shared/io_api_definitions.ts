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
  
export interface VcWithWorkersUtil {
    vc:         I_ValueChain,
    wosUtil:    PsWorkerUtilization[]
}  


export interface PsWithWorkersWithUtil {
    ps:         I_ProcessStep,
    wosUtil:    WorkerWithUtilization[]
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
    itemPerTimeUnit:    number,
    valuePerTimeUnit:   number
}

export interface I_WorkItemStats {
    hasCalculatedStats: boolean,
    throughput:         WorkItemStatsThroughput,
    cycleTime:          WorkItemStatsCycleTime
}