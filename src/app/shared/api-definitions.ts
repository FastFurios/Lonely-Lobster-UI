// ######################################################################
// ## Lonely Lobster API definitions 
// ######################################################################

// to-do: share these definitions as project references wth backend and frontend
// see: https://wallis.dev/blog/typescript-project-references

type Effort         = number // measured in Worker Time Units
type Value          = number // measured in Worker Time Units
type ValueChainId   = string
type ProcessStepId  = string
type WorkItemId     = number
type WorkItemTag    = [string, string]
type WorkerName     = string
type TimeStamp      = number

// request to iterate

export interface I_IterationRequest {
    time?: number
    newWorkOrders: {
        valueChainId:ValueChainId 
        numWorkOrders: number
    }[]
}
// response on "iterate" request

export interface I_WorkItem {
    id:                             WorkItemId
    tag:                            WorkItemTag
    accumulatedEffortInProcessStep: number
    elapsedTimeInProcessStep:       number
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

export interface I_EndProduct {
    id:                             WorkItemId
    tag:                            WorkItemTag
    accumulatedEffortInValueChain:  number
    valueOfValueChain:              Value
    elapsedTimeInValueChain:        number
}

export interface I_OutputBasket {
    workItems:                      I_EndProduct[]
}

export interface I_WorkerState {
    worker:                         WorkerName
    utilization:                    number
    assignmentsInfo:                string
}

/*
export interface I_WorkerState {
    worker:                         WorkerName
    utilization:                    number
}
*/


export interface I_SystemState {
    id:                             string,
    time:                           TimeStamp,
    valueChains:                    I_ValueChain[]
    outputBasket:                   I_OutputBasket
    workersState:                   I_WorkerState[]
}

