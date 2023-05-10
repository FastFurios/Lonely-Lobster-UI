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

interface I_IterationRequest {
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


export interface I_SystemState {
    id:                             string,
    time:                           TimeStamp,
    valueChains:                    I_ValueChain[]
    outputBasket:                   I_OutputBasket
    workersState:                   I_WorkerState[]
}


// mock data

let systemStates: I_SystemState[] = [
    // clock == 0
    {
        id: "Mock-Machine",
        time: 0,
        valueChains: [
            {
                id: "blue",
                totalValueAdd: 20,
                processSteps: [
                    {
                        id:          "first",
                        normEffort:  4,
                        workItems:   [
                            {
                                id:                             1,
                                tag:                            ["a", "A"],
                                accumulatedEffortInProcessStep: 0,
                                elapsedTimeInProcessStep:       0
                            },
                            {
                                id:                             2,
                                tag:                            ["b", "B"],
                                accumulatedEffortInProcessStep: 1,
                                elapsedTimeInProcessStep:       1
                            }
                        ],
                        workItemFlow: 0
                    },
                    {
                        id:          "second",
                        normEffort:  5,
                        workItems:   [
                            {
                                id:                             3,
                                tag:                            ["c", "C"],
                                accumulatedEffortInProcessStep: 2,
                                elapsedTimeInProcessStep:       3
                            }
                        ],
                        workItemFlow: 0
                    }
                ]
            }
        ],
        outputBasket: {
            workItems: [] 
        },
        workersState: [
            {
                worker: "Harry",
                utilization: 80,
                assignmentsInfo: "blabla"
            }
        ]
    },
// clock == 1
    {
        id: "Mock-Machine",
        time: 1,
        valueChains: [
            {
                id: "blue",
                totalValueAdd: 20,
                processSteps: [
                    {
                        id:          "first",
                        normEffort:  1,
                        workItems:   [
                            {
                                id:                             2,
                                tag:                            ["b", "B"],
                                accumulatedEffortInProcessStep: 1,
                                elapsedTimeInProcessStep:       2
                            }
                        ],
                        workItemFlow: 1
                    },
                    {
                        id:          "second",
                        normEffort:  5,
                        workItems:   [
                            {
                                id:                             1,
                                tag:                            ["a", "A"],
                                accumulatedEffortInProcessStep: 0,
                                elapsedTimeInProcessStep:       0
                            },
                            {
                                id:                             3,
                                tag:                            ["c", "C"],
                                accumulatedEffortInProcessStep: 3,
                                elapsedTimeInProcessStep:       4
                            }
                        ],
                        workItemFlow: 0
                    }
                ]
            }
        ],
        outputBasket: {
            workItems: [] 
        },
        workersState: [
            {
                worker: "Harry",
                utilization: 100,
                assignmentsInfo: "blabla"

            },
            {
                worker: "Sally",
                utilization: 50,
                assignmentsInfo: "blabla"

            }
        ]
    },
// clock == 1
    {
        id: "Mock-Machine",
        time: 2,
        valueChains: [
            {
                id: "blue",
                totalValueAdd: 20,
                processSteps: [
                    {
                        id:          "first",
                        normEffort:  1,
                        workItems:   [
                            {
                                id:                             2,
                                tag:                            ["b", "B"],
                                accumulatedEffortInProcessStep: 1,
                                elapsedTimeInProcessStep:       2
                            }
                        ],
                        workItemFlow: 1
                    },
                    {
                        id:          "second",
                        normEffort:  5,
                        workItems:   [
                            {
                                id:                             1,
                                tag:                            ["a", "A"],
                                accumulatedEffortInProcessStep: 0,
                                elapsedTimeInProcessStep:       0
                            },
                            {
                                id:                             3,
                                tag:                            ["c", "C"],
                                accumulatedEffortInProcessStep: 3,
                                elapsedTimeInProcessStep:       4
                            }
                        ],
                        workItemFlow: 0
                    }
                ]
            }
        ],
        outputBasket: {
            workItems: [] 
        },
        workersState: [
            {
                worker: "Harry",
                utilization: 100,
                assignmentsInfo: "blabla"

            },
            {
                worker: "Sally",
                utilization: 40,
                assignmentsInfo: "blabla"

            }
        ]
    },
// clock == 2
    {
        id: "Mock-Machine",
        time: 3,
        valueChains: [
            {
                id: "blue",
                totalValueAdd: 20,
                processSteps: [
                    {
                        id:          "first",
                        normEffort:  1,
                        workItems:   [],
                        workItemFlow: 1
                    },
                    {
                        id:          "second",
                        normEffort:  5,
                        workItems:   [
                            {
                                id:                             1,
                                tag:                            ["a", "A"],
                                accumulatedEffortInProcessStep: 1,
                                elapsedTimeInProcessStep:       1
                            },
                            {
                                id:                             2,
                                tag:                            ["b", "B"],
                                accumulatedEffortInProcessStep: 3,
                                elapsedTimeInProcessStep:       3
                            }
                        ],
                        workItemFlow: 0
                    }
                ]
            }
        ],
        outputBasket: {
            workItems: [
                {
                    id:                             3,
                    tag:                            ["c", "C"],
                    accumulatedEffortInValueChain:  5,
                    valueOfValueChain:              20,
                    elapsedTimeInValueChain:        6                }
            ]
        },
        workersState: [
            {
                worker: "Harry",
                utilization: 100,
                assignmentsInfo: "blabla"

            },
            {
                worker: "Sally",
                utilization: 20,
                assignmentsInfo: "blabla"

            }
        ]
    }
]

