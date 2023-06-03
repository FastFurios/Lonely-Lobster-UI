// ########################################################################################################
//                                  LONELY LOBSTER
// a simulation of colaboration of workers in a company with multiple value chains
//      depending upon individual worker's strategies what to work on next 
//                          Gerold Lindorfer, Dec 2022 ff.
// ########################################################################################################

import { Clock } from './clock.js'
import { DebugShowOptions, systemCreatedFromConfigFile } from './io_config.js'
import { processWorkOrderFile } from './io_workload.js'
import { nextSystemState } from './io_api.js'
import { workItemIdGenerator, wiTagGenerator, wiTags } from './workitem.js'
import { OutputBasket } from './workitembasketholder.js'
import { LonelyLobsterSystem } from './system.js'

import express from 'express'

// set debug defauls in case the io_connfig.json does not contain any debug properties
const debugShowOptionsDefaults: DebugShowOptions = { 
    clock:          false,
    workerChoices:  false,
    readFiles:      false  
}
export var debugShowOptions: DebugShowOptions = debugShowOptionsDefaults 

// create a clock (it will be 'ticked' by the read rows of the workflow file)
export const clock = new Clock()

// create the sink of all fully processed workitems
export const outputBasket = new OutputBasket()

// create a generator for the id and a (non-unique) tag for each new workitem
export const idGen = workItemIdGenerator()
export const tagGen = wiTagGenerator(wiTags)

// define where to find the comand line arguments (e.g. $ node target/_main.js test/LonelyLobster_Testcase0037.json test/workload_50_blue_burst_15_green_burst_10.csv)
enum InputArgs {
    "SystemConfig"      = 2,
    "WorkOrders"        = 3
}
// create the system from the config JSON file
export const lonelyLobsterSystem = systemCreatedFromConfigFile(process.argv[InputArgs.SystemConfig])

if(debugShowOptions.readFiles) console.log("argv[2]=" + process.argv[2] + ", " + "argv[3]=" + process.argv[3] +"\n")

if (process.argv[InputArgs.WorkOrders]) {
    // process the workload file
    processWorkOrderFile(process.argv[InputArgs.WorkOrders], lonelyLobsterSystem)
} 
else {
    // listen to API and process incoming requests
    const app = express()
    const port = 3000
    
    app.use(express.json()) // for parsing application/json
    app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
    
    app.use(function (req, res, next) {
      // Enabling CORS
      res.header("Access-Control-Allow-Origin", "http://localhost:4200");
      res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
        next();
      });
    
    let clockTime = 0

/*    
    function nextSystemState(): I_SystemState {
      const systemState = systemStates[clockTime]
      clockTime = clockTime >= 3 ? 0 : clockTime + 1
      console.log("ClockTime = " + clockTime)
      return systemState
    }
    
    app.get('/', (req, res) => {
      console.log("GET Request came in from " + req.headers.origin)
      res.send(nextSystemState())
    })
*/    
    app.post('/', (req, res) => {
//        console.log("POST Request came in from " + req.headers.origin)
//        console.log("Request body:")
//        console.log(req.body)
/*
        lonelyLobsterSystem.doNextIteration(
            req.body.time, 
            workOrderList(lonelyLobsterSystem, 
                          { time: req.body.time,
                            newWorkOrders: req.body.newWorkOrders } ) 
        )
*/
//      const sysState: I_SystemState = nextSystemState(lonelyLobsterSystem, req.body)
//      const sysState: I_SystemState = systemStates[0]
        console.log("Returning real sysState json to Angular FE... ")
//      console.log(sysState)
//      res.send(sysState)
        console.log("_main: app.post: received request=")
        console.log(req.body)
        res.send(nextSystemState(lonelyLobsterSystem, req.body))
      })
      
    app.listen(port, () => {
      return console.log(`Express is listening at http://localhost:${port}`)
    })
    
    
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
    
    // response on "iterate" request
    
    interface I_WorkItem {
        id:                             WorkItemId
        tag:                            WorkItemTag
        accumulatedEffortInProcessStep: number
        elapsedTimeInProcessStep:       number
    }
    
    interface I_ProcessStep {
        id:                             ProcessStepId
        normEffort:                     Effort
        workItems:                      I_WorkItem[]
        workItemFlow:                   number
    }
    
    interface I_ValueChain {
        id:                             ValueChainId
        totalValueAdd:                  Value
        processSteps:                   I_ProcessStep[]
    }
    
    interface I_EndProduct {
        id:                             WorkItemId
        tag:                            WorkItemTag
        accumulatedEffortInValueChain:  number
        valueOfValueChain:              Value
        elapsedTimeInValueChain:        number
    }
    
    interface I_OutputBasket {
        workItems:                      I_EndProduct[]
    }
    
    interface I_WorkerState {
        worker:                         WorkerName
        utilization:                    number
    }
    
    
    interface I_SystemState {
        id:                             string,
        valueChains:                    I_ValueChain[]
        outputBasket:                   I_OutputBasket
        workerUtilization:              I_WorkerState[]
    }
    
    
    // mock data
    
    let systemStates: I_SystemState[] = [
        // clock == 0
        {
            id: "Mock-Machine 0",
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
                            workItemFlow: 10
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
                            workItemFlow: 15
                        }
                    ]
                }
            ],
            outputBasket: {
                workItems: [] 
            },
            workerUtilization: [
                {
                    worker: "Harry",
                    utilization: 80
                },
                {
                    worker: "Sally",
                    utilization: 10
                }
            ]
        },
    // clock == 1
        {
            id: "Mock-Machine 1",
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
                            workItemFlow: 25
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
                            workItemFlow: 10
                        }
                    ]
                }
            ],
            outputBasket: {
                workItems: [] 
            },
            workerUtilization: [
                {
                    worker: "Harry",
                    utilization: 100
                },
                {
                    worker: "Sally",
                    utilization: 50
                }
            ]
        },
    // clock == 2
        {
            id: "Mock-Machine 2",
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
                                    accumulatedEffortInProcessStep: 2,
                                    elapsedTimeInProcessStep:       3
                                }
                            ],
                            workItemFlow: 0
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
                                    id:                             3,
                                    tag:                            ["c", "C"],
                                    accumulatedEffortInProcessStep: 3,
                                    elapsedTimeInProcessStep:       5
                                }
                            ],
                            workItemFlow: 30
                        }
                    ]
                }
            ],
            outputBasket: {
                workItems: [] 
            },
            workerUtilization: [
                {
                    worker: "Harry",
                    utilization: 100
                },
                {
                    worker: "Sally",
                    utilization: 40
                }
            ]
        },
    // clock == 3
        {
            id: "Mock-Machine 3",
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
                                id:                             4,
                                tag:                            ["e", "E"],
                                accumulatedEffortInProcessStep: 0,
                                elapsedTimeInProcessStep:       0
                              },
                              {
                                id:                             5,
                                tag:                            ["f", "F"],
                                accumulatedEffortInProcessStep: 3,
                                elapsedTimeInProcessStep:       0
                              },
                              {
                                id:                             6,
                                tag:                            ["g", "G"],
                                accumulatedEffortInProcessStep: 1,
                                elapsedTimeInProcessStep:       0
                              },
                              {
                                id:                             7,
                                tag:                            ["h", "H"],
                                accumulatedEffortInProcessStep: 2,
                                elapsedTimeInProcessStep:       0
                              },
                              {
                                id:                             8,
                                tag:                            ["i", "I"],
                                accumulatedEffortInProcessStep: 4,
                                elapsedTimeInProcessStep:       3
                              },
                              {
                                id:                             9,
                                tag:                            ["j", "J"],
                                accumulatedEffortInProcessStep: 2,
                                elapsedTimeInProcessStep:       7
                              }
                            ],
                            workItemFlow: 20
                        },
                        {
                            id:          "second",
                            normEffort:  5,
                            workItems:   [
                                {
                                    id:                             1,
                                    tag:                            ["a", "A"],
                                    accumulatedEffortInProcessStep: 2,
                                    elapsedTimeInProcessStep:       2
                                },
                                {
                                    id:                             2,
                                    tag:                            ["b", "B"],
                                    accumulatedEffortInProcessStep: 0,
                                    elapsedTimeInProcessStep:       0
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
                      elapsedTimeInValueChain:        6                
                    }
                ]
            },
            workerUtilization: [
                {
                    worker: "Harry",
                    utilization: 100
                },
                {
                    worker: "Sally",
                    utilization: 20
                }
            ]
        }
    ]
    
    
}