// --------------------------------------------------------------------------------
//  take api request and feed it to the LonelyLobster system for the next iteration
// --------------------------------------------------------------------------------

import { duplicate } from "./helpers.js"
import { LonelyLobsterSystem } from "./system.js"
import { ValueChain } from './valuechain.js'
import { WorkOrder, WiExtInfoElem } from './workitem.js'
import { I_SystemState, I_ValueChain, I_ProcessStep, I_WorkItem, I_OutputBasket, I_WorkerState } from './io_api_definitions.js'
import { WorkItem, wiTags } from './workitem.js';
import { ProcessStep, OutputBasket } from './workitembasketholder.js';
import { clock, outputBasket } from './_main.js'
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
  console.log("Lonely Lobster Backend: io_api: nextSystemState(): iterReq=")
  console.log(iterReq)

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
          valueChainId: wi.valueChain.id,
          value: wi.valueChain.totalValueAdd,
          maxEffort: (<ProcessStep>wi.currentProcessStep).normEffort,
          processStepId: wi.currentProcessStep.id,
          accumulatedEffort: wi.extendedInfos.workOrderExtendedInfos[WiExtInfoElem.accumulatedEffortInProcessStep],
          elapsedTime: wi.extendedInfos.workOrderExtendedInfos[WiExtInfoElem.elapsedTimeInProcessStep]
        }
      }

      function i_processStep(ps: ProcessStep): I_ProcessStep {
        return {
          id: ps.id,
          normEffort: ps.normEffort,
          workItems: ps.workItemBasket.map(wi => i_workItem(wi)),
          workItemFlow: ps.lastIterationFlowRate
        }
      }

      function i_valueChain(vc: ValueChain): I_ValueChain {
        return {
          id: vc.id,
          totalValueAdd: vc.totalValueAdd,
          processSteps: vc.processSteps.map(ps => i_processStep(ps))
        }
      }

      function i_endProduct (wi: WorkItem): I_WorkItem { 
        return {
          id: wi.id,
          tag: wiTags[0],
          valueChainId: wi.valueChain.id,
          value: wi.valueChain.totalValueAdd,
          maxEffort: wi.valueChain.processSteps.map(ps => ps.normEffort).reduce((e1, e2) => e1 + e2),
          processStepId: wi.currentProcessStep.id,
          accumulatedEffort: wi.extendedInfos.workOrderExtendedInfos[WiExtInfoElem.accumulatedEffortInValueChain],
          elapsedTime: wi.extendedInfos.workOrderExtendedInfos[WiExtInfoElem.elapsedTimeInValueChain]
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
          utilization: wo.stats.utilization,
          assignments: wo.stats.assignments.map(a => {
            return {
              valueChain:  a.valueChain.id,
              processStep: a.processStep.id
            }
          })
        }
      }

      return {
        id: sys.id,
        time: clock.time,
        valueChains: sys.valueChains.map(vc => i_valueChain(vc)),
        outputBasket: { workItems: outputBasket.workItemBasket.map(wi => i_endProduct(wi)) },
        workersState: sys.workers.map(wo => i_workerState(wo))
      }
    }

    sys.doNextIteration(
        iterReq.time!, 
        workOrderList(sys, 
                      { time: iterReq.time!,
                        newWorkOrders: iterReq.newWorkOrders } ))
    return i_systemState(sys)
}

