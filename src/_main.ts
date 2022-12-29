// ########################################################################################################
//                                  LONELY LOBSTER
// a simulation of colaboration of workers in a company with multiple value chains
//      depending upon individual worker's strategies what to work on next 
//                          Gerold Lindorfer, Dec 2020 ff.
// ########################################################################################################

import { Clock } from './clock.js'
import { OutputBasket } from './workitembasketholder.js'
import { systemCreatedFromConfigFile, processWorkOrderFile } from './helpers.js'

export interface DebugShowOptions  {
    clock:          boolean,
    workerChoices:  boolean,
    readFiles:      boolean
}

export const debugShowOptions = {
    clock:          false,
    workerChoices:  false,
    readFiles:      false
}

export const clock = new Clock()

export const outputBasket = new OutputBasket()

enum InputArgs {
    "SystemConfig"      = 2,
    "WorkOrders"        = 3
}

if(debugShowOptions.readFiles) console.log("argv[2]=" + process.argv[2] + ", " + "argv[3]=" + process.argv[3] +"\n")

export const lonelyLobsterSystem = systemCreatedFromConfigFile(process.argv[InputArgs.SystemConfig])

processWorkOrderFile(process.argv[InputArgs.WorkOrders], lonelyLobsterSystem)
