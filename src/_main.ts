// ########################################################################################################
//                                  LONELY LOBSTER
// a simulation of colaboration of workers in a company with multiple value chains
//      depending upon individual worker's strategies what to work on next 
//                          Gerold Lindorfer, Dec 2020 ff.
// ########################################################################################################

import { Clock } from './clock.js'
import { DebugShowOptions, systemCreatedFromConfigFile } from './io_config.js'
import { processWorkOrderFile } from './io_workload.js'
import { workItemIdGenerator, wiTagGenerator, wiTags } from './workitem.js'
import { OutputBasket } from './workitembasketholder.js'

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

// process the workload file
processWorkOrderFile(process.argv[InputArgs.WorkOrders], lonelyLobsterSystem)
