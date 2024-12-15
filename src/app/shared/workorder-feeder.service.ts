//-------------------------------------------------------------------
// WORKORDER FEEDER SERVICE
//-------------------------------------------------------------------
// last code cleaning: 15.12.2024
import { Injectable } from '@angular/core'
import { I_IterationRequest, I_IterationRequests, ValueChainId, Injection, ProcessStepId, I_VcPsWipLimit,WipLimit } from './io_api_definitions'
import { DoubleStringMap } from './helpers'


type VcFeederParmsAndState = {
  aggregatedWorkOrders:   number, // being managed by ...
  parms:                  Injection
}

/**
 * @class This Angular service generates the workorders to be injected into the value chains based on the injection parameters  
 */
@Injectable({
  providedIn: 'root'
})
export class WorkorderFeederService {

    /**
     * Maps that contains for each value chain the current injection parameters and the current state i.e. the accumulated workorders
     */
    private vcFeederTimeUnitMap:    Map<ValueChainId, VcFeederParmsAndState>
    /**
     * Maps that contains for each process step the current wip limit
     */
    private vcPsWipLimitMap:        DoubleStringMap<WipLimit>

    /**
    * @private
    */
    constructor() { }

    /**
     * Set or replace injection parameters by the new current parameters; keep the number of already accumulated virtual workorders 
     * @param vcId - Value chain 
     * @param inj - new injection parameters
     */
    public setInjectionParms(vcId: ValueChainId, inj: Injection): void {
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

    /**
     * Looks up the current injection parameters
     * @param vcId - value chain
     * @returns injection parameters or undefined if not found
     */
    public getInjectionParms(vcId: ValueChainId): Injection | undefined {
        return this.vcFeederTimeUnitMap.has(vcId) ? this.vcFeederTimeUnitMap.get(vcId)!.parms : undefined
    }

    /**
     * Sets or replaces the current wip limits 
     * @param vcId - value chain
     * @param psId - process step
     * @param wipLimit - new wip limit
     */
    public setWipLimit(vcId: ValueChainId, psId: ProcessStepId, wipLimit: WipLimit) {
        this.vcPsWipLimitMap.dsSet([vcId, psId], wipLimit)
    }

    /**
     * Generates an iteration request to be sent to the backend for all value chains based on the current injection and wip limit settings and the current accumulated virtual worksorders for each value chain.
     * See also in "io_api_definitions.ts" for examples how work order injection works.
     * @param batchSize - number of iterations the requests is for 
     * @param optimizeWipLimits - true if auto optimization of wip limits is turned on
     * @returns iteration request for an iteration (or for each iteration within an iteration batch)  
     */
    public iterationRequestsForAllVcs(batchSize: number, optimizeWipLimits: boolean): I_IterationRequests {
        const iterationRequests: I_IterationRequests = []
        const constWipLimits: I_VcPsWipLimit[] = []

        for (const [vcPsWipLimitKey0, vcPsWipLimitKey1, wipLimit] of this.vcPsWipLimitMap.dsEntries()) { // for all process-steps with a wip-limit
            constWipLimits.push({vc: vcPsWipLimitKey0, ps: vcPsWipLimitKey1, wipLimit: wipLimit})
        }

        for (let i = 0; i < batchSize; i++) { // for all requests in the batch
            const iterationRequest: I_IterationRequest = { 
                vcsWorkOrders:      [],
                wipLimits:          [],
                optimizeWipLimits:  optimizeWipLimits
            } 
            for (const [vcId, vcFeederParmsAndState] of this.vcFeederTimeUnitMap.entries()) { // for all value-chains
                vcFeederParmsAndState.aggregatedWorkOrders += vcFeederParmsAndState.parms.throughput // add throughput number of workitems to the already accumulated new work orders

                let injectWosNum: number
                if (Math.random() < vcFeederParmsAndState.parms.probability) {  // "roll the dice" if it is time for injection 
                    injectWosNum = Math.floor(vcFeederParmsAndState.aggregatedWorkOrders)  // take all work orders
                    vcFeederParmsAndState.aggregatedWorkOrders -= injectWosNum  // leave back the remainder 
                }
                else injectWosNum = 0

                iterationRequest.vcsWorkOrders.push({
                    valueChainId:  vcId, 
                    numWorkOrders: injectWosNum
                })
            }
            iterationRequest.wipLimits = constWipLimits
            iterationRequests.push(iterationRequest)
        }           
        return iterationRequests
    }

    /**
     * Initialize the feeder service
     */
    public initialize(): void {
        this.vcFeederTimeUnitMap = new Map<ValueChainId, VcFeederParmsAndState>()
        this.vcPsWipLimitMap     = new DoubleStringMap<WipLimit>()
    }
}
