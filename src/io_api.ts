// --------------------------------------------------------------------------------
//  take api request and feed it to the LonelyLobster system for the next iteration
// --------------------------------------------------------------------------------

import { Timestamp } from "./clock.js"
import { Tuple, duplicate, tupleBuilderFrom2Arrays } from "./helpers.js"
import { LonelyLobsterSystem } from "./system.js"
import { ValueChain } from './valuechain.js'
import { WorkOrder, WiExtInfoElem } from './workitem.js'
import { I_SystemState, I_ValueChain, I_ProcessStep, I_WorkItem, I_OutputBasket, I_EndProduct, I_WorkerState } from './api-definitions.js'
import { WorkItem, wiTags } from './workitem.js';
import { ProcessStep, OutputBasket } from './workitembasketholder.js';
import { outputBasket } from './_main.js'
import { Worker } from './worker';




type ValueChainId = string 

interface I_IterationRequest {
    time?: number
    newWorkOrders: {
        valueChainId: ValueChainId 
        numWorkOrders: number
    }[]
  }
  

type MaybeValueChain = ValueChain | undefined

export function nextSystemState(sys: LonelyLobsterSystem, iterReq: I_IterationRequest): I_SystemState {
    function workOrderList(sys: LonelyLobsterSystem, iterReq: I_IterationRequest): WorkOrder[] {
      //    console.log("io_api//workOrderList/iterReq =")
      //    console.log(iterReq)
          return iterReq.newWorkOrders.flatMap(nwo => duplicate<WorkOrder>(
                                                  { timestamp:    iterReq.time!, 
                                                    valueChain:   sys.valueChains.find(vc => vc.id == nwo.valueChainId.trim())! },
                                                  nwo.numWorkOrders ))
      }
    

    function i_systemState(sys: LonelyLobsterSystem): I_SystemState {

      function i_workItem (wi: WorkItem): I_WorkItem { 
        return {
          id: wi.id,
          tag: wiTags[0],
          accumulatedEffortInProcessStep: wi.extendedInfos.workOrderExtendedInfos[WiExtInfoElem.accumulatedEffortInProcessStep],
          elapsedTimeInProcessStep: wi.extendedInfos.workOrderExtendedInfos[WiExtInfoElem.elapsedTimeInProcessStep]
        }
      }

      function i_processStep(ps: ProcessStep): I_ProcessStep {
        return {
          id: ps.id,
          normEffort: ps.normEffort,
          workItems: ps.workItemBasket.map(wi => i_workItem(wi)),
          workItemFlow: 0 // yet to be filled
        }
      }

      function i_valueChain(vc: ValueChain): I_ValueChain {
        return {
          id: vc.id,
          totalValueAdd: vc.totalValueAdd,
          processSteps: vc.processSteps.map(ps => i_processStep(ps))
        }
      }

      function i_endProduct (wi: WorkItem): I_EndProduct { 
        return {
          id: wi.id,
          tag: wiTags[0],
          accumulatedEffortInValueChain: wi.extendedInfos.workOrderExtendedInfos[WiExtInfoElem.accumulatedEffortInValueChain],
          valueOfValueChain: wi.valueChain.totalValueAdd,
          elapsedTimeInValueChain: wi.extendedInfos.workOrderExtendedInfos[WiExtInfoElem.elapsedTimeInValueChain]
        }
      }

      function i_outputBasket(ob: OutputBasket): I_OutputBasket {
        return {
          workItems: ob.workItemBasket.map(wi => i_endProduct(wi))
        }
      }

      function i_workerState(wo: Worker): I_WorkerState {
        return {
          worker: wo.id,
          utilization: 0 // yet to be filled
        }
      }

      return {
        id: sys.id,
        valueChains: sys.valueChains.map(vc => i_valueChain(vc)),
        outputBasket: { workItems: outputBasket.workItemBasket.map(wi => i_endProduct(wi)) },
        workerUtilization: sys.workers.map(wo => i_workerState(wo))
      }
    }

    sys.doNextIteration(
        iterReq.time!, 
        workOrderList(sys, 
                      { time: iterReq.time!,
                        newWorkOrders: iterReq.newWorkOrders } ) 
    )
    return i_systemState(sys)
}

