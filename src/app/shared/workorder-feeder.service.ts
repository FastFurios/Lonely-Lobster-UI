import { Injectable } from '@angular/core'
import { I_IterationRequest, ValueChainId } from './io_api_definitions'

export type VcFeederParms = {  // for each time unit
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

    private vcFeederTimeUnitMap:    Map<ValueChainId, VcFeederParmsAndState>
    private timeNow:                number

    constructor() {
        this.initialize()
    }

    // tb deleted
/*
    wofAsString = () =>  Array.from(this.vcFeederTimeUnitMap.entries())
        .map(e => e[0] + ": aggrWos=" + e[1].aggregatedWorkOrders
                        + " thruput=" + e[1].parms.avgInjectionThroughput
                    + " prob=" + e[1].parms.injectProbability
                    )
*/
    public setParms(vcId: ValueChainId, avgInjThroughput: number, injProb: number): void {
        if (avgInjThroughput == undefined || injProb == undefined) return
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

    public getParms(vcId: ValueChainId): VcFeederParms | undefined {
        return this.vcFeederTimeUnitMap.has(vcId) ? this.vcFeederTimeUnitMap.get(vcId)!.parms : undefined
    }

    public iterationRequestForAllVcs(): I_IterationRequest {
        const iterationRequest: I_IterationRequest = { 
            time:           this.timeNow++,
            newWorkOrders:  [] 
        } 
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
        return iterationRequest
    }

    public initialize(): void {
        this.vcFeederTimeUnitMap = new Map<ValueChainId, VcFeederParmsAndState>()
    }
}
