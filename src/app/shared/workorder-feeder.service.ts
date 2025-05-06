//-------------------------------------------------------------------
// WORKORDER FEEDER SERVICE
//-------------------------------------------------------------------

import { Injectable } from '@angular/core'
import { I_IterationRequest, I_IterationRequests, ValueChainId, Injection, ProcessStepId, I_VcPsWipLimit,WipLimit, I_VcWorkOrders } from './io_api_definitions'
import { WorkOrdersFromFile } from "../app.component"
import { DoubleStringMap } from './helpers'


type VcFeederParmsAndState = {
  aggregatedWorkOrders:   number, // being managed by ...
  parms:                  Injection
}

/**
 * @class This class holds the work orders read from the file and serves them in round-robin fashion to the callers of next()
 */
class WorkordersFromFileContainer {
    private nextWosTimeUnitIdx: number

    constructor(public  filename:   string,
                private workorders: WorkOrdersFromFile) {
        this.reset()
    }   

    public next(): I_VcWorkOrders[] {
        const wosForTimeunit = this.workorders.rows[this.nextWosTimeUnitIdx]
        this.nextWosTimeUnitIdx = (this.nextWosTimeUnitIdx + 1) % this.workorders.rows.length
        return wosForTimeunit.slice(1).map((numWos, idx) => { return {
            valueChainId:   this.workorders.header.slice(1)[idx],
            numWorkOrders:  numWos
        }})
    }

    private reset(): void {
        this.nextWosTimeUnitIdx = 0
    }

    /** returns the header names for the columns with the work order values */
    get headers(): string[] {
        return this.workorders.header.slice(1)
    }
}


/**
 * @class This Angular service generates the workorders to be injected into the value chains based on the injection parameters  
 * or alteratively based on the uploaded work order file
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
     * The list of work orders uploaded from a csv file
     */
    private  workordersFromFile:     WorkordersFromFileContainer

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
     * Generates an iteration request to be sent to the backend for all value chains based on the current injection and wip limit settings and the current accumulated virtual work orders for each value chain.
     * See also in "io_api_definitions.ts" for examples how work order injection works.
     * @param batchSize - number of iterations the request is for 
     * @param optimizeWipLimits - true if auto optimization of wip limits is turned on
     * @returns iteration request for an iteration (or for each iteration within an iteration batch)  
     */
    public iterationRequestsForAllVcs(batchSize: number, optimizeWipLimits: boolean, workordersComeFromFile: boolean): I_IterationRequests {
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
            if (workordersComeFromFile) { 
                // feeding work orders that come from the selected work orders file
                iterationRequest.vcsWorkOrders = this.workordersFromFile.next()
            }
            else { 
                // feeding work orders by injection parameters
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
            }

            iterationRequest.wipLimits = constWipLimits
            iterationRequests.push(iterationRequest)
        }           
        return iterationRequests
    }

    /**
     * store the filename from which the work orders were read and also the work order array
     * @param wosFilename name of file from where the work orders were read
     * @param wosFromFile array over time units with work orders objects for each value chains
     */
    public storeWorkordersFromFile(wosFilename: string, wosFromFile: WorkOrdersFromFile): void {
        this.workordersFromFile = new WorkordersFromFileContainer(wosFilename, wosFromFile) 
    }

    /** returns work order file name or undefined if none has been loaded */
    get workordersFileName(): string | undefined {
        return this.workordersFromFile?.filename 
    }

    /**
     * check if the headers of the work order file match the value chain ids of the system configuration;
     * returns true if a work order file has been loaded AND contains a column for each value chain of the system configuration;
     * returns false otherwise i.e. if no work order file is yet loaded or at least one value chain does not have a corresponding work order file column   
     */
    public valueChainsHaveMatchingWorkorderFileColumns(vcIds: ValueChainId[]): boolean {
        if (this.workordersFromFile == undefined) return false
        return vcIds.map(vcId => this.workordersFromFile.headers.includes(vcId)).reduce((b1, b2) => b1 && b2)
    }

    /**
     * Initialize the feeder service
     */
    public initialize(): void {
        this.vcFeederTimeUnitMap = new Map<ValueChainId, VcFeederParmsAndState>()
        this.vcPsWipLimitMap     = new DoubleStringMap<WipLimit>()
    }
}


