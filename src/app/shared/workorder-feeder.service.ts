import { Injectable } from '@angular/core'
import { I_IterationRequest, ValueChainId, Injection } from './io_api_definitions'

type VcFeederParmsAndState = {
  aggregatedWorkOrders:   number, // being managed by ...
  parms:                  Injection
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

    public setParms(vcId: ValueChainId, inj: Injection): void {
        if (inj.throughput == undefined || inj.probability == undefined) return
        const aggrWos: number = this.vcFeederTimeUnitMap.has(vcId) 
                                ? this.vcFeederTimeUnitMap.get(vcId)!.aggregatedWorkOrders
                                : 0 
        this.vcFeederTimeUnitMap.set(
            vcId, 
            { 
                aggregatedWorkOrders: aggrWos,
                parms: {
                    throughput:     inj.throughput,
                    probability:    inj.probability
                }    
            })
    }

    public getParms(vcId: ValueChainId): Injection | undefined {
        return this.vcFeederTimeUnitMap.has(vcId) ? this.vcFeederTimeUnitMap.get(vcId)!.parms : undefined
    }

    public iterationRequestForAllVcs(): I_IterationRequest {
        const iterationRequest: I_IterationRequest = { 
            time:           this.timeNow++,
            newWorkOrders:  [] 
        } 
        for (const [vcId, vcFeederParmsAndState] of this.vcFeederTimeUnitMap.entries()) {
            vcFeederParmsAndState.aggregatedWorkOrders += vcFeederParmsAndState.parms.throughput 

            let injectWosNum: number
            if (Math.random() < vcFeederParmsAndState.parms.probability) {
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
