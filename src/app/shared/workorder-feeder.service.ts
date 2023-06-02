import { Injectable } from '@angular/core';
import { I_IterationRequest, ValueChainId } from './io_api_definitions'

type VcFeederParms = {  // for each time unit
  avgInjectionThroughput: number, // any number e.g. 1, 0.5, 2.1, ...
  injectProbability:      number  // any value from 0 to 1
}

type VcFeederParmsAndState = {
  aggregatedWorkOrders:   number, // being managed by ...
  parms:                  VcFeederParms
}

@Injectable({
  providedIn: 'root'
})
export class WorkorderFeederService {

    /* private */ vcFeederTimeUnitMap = new Map<ValueChainId, VcFeederParmsAndState>()

    constructor() {}

    public setParms(vcId: ValueChainId, avgInjThroughput: number, injProb: number) {
        const aggrWos: number = this.vcFeederTimeUnitMap.has(vcId) 
                                ? this.vcFeederTimeUnitMap.get(vcId)!.aggregatedWorkOrders
                                : 0 
        this.vcFeederTimeUnitMap.set(
            vcId, 
            { 
                aggregatedWorkOrders: aggrWos,
                parms: {
                    avgInjectionThroughput: avgInjThroughput,
                    injectProbability:      injProb
                }    
            })
    }

    public iterationRequest4AllVcs(): I_IterationRequest {
        const iterationRequest: I_IterationRequest = { newWorkOrders: [] } 

        for (const [vcId, vcFeederParmsAndState] of this.vcFeederTimeUnitMap.entries()) {
            vcFeederParmsAndState.aggregatedWorkOrders += vcFeederParmsAndState.parms.avgInjectionThroughput 

            let injectWosNum: number
            if (Math.random() < vcFeederParmsAndState.parms.injectProbability) {
                injectWosNum = Math.floor(vcFeederParmsAndState.aggregatedWorkOrders)
                vcFeederParmsAndState.aggregatedWorkOrders -= injectWosNum
            }
            else injectWosNum = 0

            iterationRequest.newWorkOrders.push({
                valueChainId: vcId, 
                numWorkOrders: injectWosNum
            })
        }
        iterationRequest.time = 0 
        console.log("workorder-feeder service: iterationRequest4AllVcs(): iterationRequest=")
        console.log(iterationRequest)
        return iterationRequest
    }
}
