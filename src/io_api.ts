// --------------------------------------------------------------------------------
//  take api request and feed it to the LonelyLobster system for the next iteration
// --------------------------------------------------------------------------------

import { createReadStream } from "fs"
import { Interface, createInterface } from "readline"
import { Timestamp } from "./clock.js"
import { Tuple, duplicate, tupleBuilderFrom2Arrays } from "./helpers.js"
import { LonelyLobsterSystem } from "./system.js"
import { ValueChain } from './valuechain.js'
import { WorkOrder } from './workitem.js'


type ValueChainId = string 

interface I_IterationRequest {
    time?: number
    newWorkOrders: {
        valueChainId: ValueChainId 
        numWorkOrders: number
    }[]
  }
  

type MaybeValueChain = ValueChain | undefined

export function workOrderList(sys: LonelyLobsterSystem, iterReq: I_IterationRequest): WorkOrder[] {
    console.log("io_api//workOrderList/iterReq =")
    console.log(iterReq)
    return iterReq.newWorkOrders.flatMap(nwo => duplicate<WorkOrder>(
                                            { timestamp:    iterReq.time!, 
                                              valueChain:   sys.valueChains.find(vc => vc.id == nwo.valueChainId.trim())! },
                                            nwo.numWorkOrders ))
}


