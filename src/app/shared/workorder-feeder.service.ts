import { Injectable } from '@angular/core';
import { I_IterationRequest, ValueChainId } from './io_api_definitions'
import { Timestamp } from 'rx';

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

    /* private */ vcFeederTimeUnitMap: Map<ValueChainId, VcFeederParmsAndState>
    /* private */ timeNow: number

    constructor() {
        this.initialize()
    }



    wofAsString = () =>  Array.from(this.vcFeederTimeUnitMap.entries())
        .map(e => e[0] + ": aggrWos=" + e[1].aggregatedWorkOrders
                        + " thruput=" + e[1].parms.avgInjectionThroughput
                    + " prob=" + e[1].parms.injectProbability
                    )

    public setParms(vcId: ValueChainId, avgInjThroughput: number, injProb: number): void {
        //console.log("WorkorderFeeder: setParms(" + vcId + ", " + avgInjThroughput + ", " + injProb)
        //console.log("WorkorderFeeder: setParms: vcFeederTimeUnitMap=")
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

//      console.log(this.wofAsString())


    }

    public getParms(vcId: ValueChainId): VcFeederParms | undefined {
//        console.log("WorkorderFeeder: getParms: vcFeederTimeUnitMap=")
//        console.log(this.wofAsString())
//        console.log("WorkorderFeeder: getParms: vcFeederTimeUnitMap.has(" + vcId + ")=" + this.vcFeederTimeUnitMap.has(vcId))

        const r = this.vcFeederTimeUnitMap.has(vcId) ? this.vcFeederTimeUnitMap.get(vcId)!.parms : undefined
 //       console.log("WorkorderFeederService: WorkorderFeederService("+vcId+") = ")
 //       console.log(r)
        return r
    }



    public iterationRequest4AllVcs(): I_IterationRequest {
        const iterationRequest: I_IterationRequest = { 
            time:           this.timeNow++,
            newWorkOrders:  [] 
        } 

//      console.log("workorder-feeder service: iterationRequest4AllVcs(): before VCs filled: iterationRequest=")
//        console.log(iterationRequest)

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
         
  //    console.log("workorder-feeder service: iterationRequest4AllVcs(): iterationRequest=")
  //    console.log(iterationRequest)
        return iterationRequest
    }

    initialize(): void {
        this.timeNow = 0
        this.vcFeederTimeUnitMap = new Map<ValueChainId, VcFeederParmsAndState>()
    }

}
