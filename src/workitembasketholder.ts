//----------------------------------------------------------------------
//    WORKITEM BASKET HOLDER
//----------------------------------------------------------------------

import { clock } from './_main.js'
import { Timestamp } from './clock.js'
import { ValueChain } from './valuechain.js'
import { WorkItem, ElapsedTimeMode, StatsEventForExitingAProcessStep } from './workitem.js'
import { I_EndProductStatistics, I_EndProductMoreStatistics } from './io_api_definitions.js'

export type Effort    = number // measured in Worker Time Units



// ------------------------------------------------------------
// WORKITEM BASKET HOLDER
// ------------------------------------------------------------

export abstract class WorkItemBasketHolder {
    public workItemBasket: WorkItem[] = []

    constructor(public id: string, 
                public barLen: number = 20) {}

    public addToBasket(workItem: WorkItem) { 
        this.workItemBasket.push(workItem) 
        workItem.logMovedTo(this)
    }

    public flowStats(fromTime: Timestamp, toTime: Timestamp): StatsEventForExitingAProcessStep[] {  // ## rename to "flowStats(...)"
        return this.workItemBasket.flatMap(wi => wi.statisticsEventsHistory(fromTime, toTime))
    }

    public accumulatedEffortMade(until: Timestamp): Effort {
        //console.log("workitemholder.accumulatedEffort() of ProcessStep=" + this.id + " is:")
        //this.workItemBasket.forEach(wi => console.log("  wi.id= " + wi.id + " accum.Effort= " + wi.accumulatedEffort()))
        return this.workItemBasket.map(wi => wi.accumulatedEffort(until)).reduce((ef1, ef2) => ef1 + ef2, 0 )
    }
 
        public abstract stringified(): string

    public stringifiedBar = (): string => { 
        const strOfBskLen = this.workItemBasket.length.toString()
        return this.workItemBasket
                .map(wi => wi.workedOnAtCurrentProcessStep() ? wi.tag[1] : wi.tag[0])
                .reduce((a, b) => a + b, "")
                .padEnd(this.barLen - strOfBskLen.length, " ")
                .substring(0, this.barLen - strOfBskLen.length)
            + strOfBskLen 
    }  

    public stringifyBasketItems = (): string => this.workItemBasket.length == 0 ? "empty" : this.workItemBasket.map(wi => "\t\t" + wi.stringified()).reduce((a, b) => a + " " + b)
}

//----------------------------------------------------------------------
//    PROCESS STEP 
//----------------------------------------------------------------------

export class ProcessStep extends WorkItemBasketHolder  {
    public lastIterationFlowRate: number = 0

    constructor(       id:            string,
                public valueChain:    ValueChain,
                public normEffort:    Effort,
                       barLen:        number) {
        super(id, barLen)
    }

    public removeFromBasket(workItem: WorkItem) { 
        this.lastIterationFlowRate += this.workItemBasket.some(wi => wi == workItem) ? 1 : 0  
        this.workItemBasket = this.workItemBasket.filter(wi => wi != workItem)  
    }

    public stringified = () => `\tt=${clock.time} basket of ps=${this.id} ne=${this.normEffort}:\n` + this.stringifyBasketItems()
}


//----------------------------------------------------------------------
//    OUTPUT BASKET 
//----------------------------------------------------------------------
//-- overall  OUTPUT BASKET (just one unique instance): here the total output of all value chains is collected over time

export class OutputBasket extends WorkItemBasketHolder {
    static numInstances = 0
    constructor() { 
        super("OutputBasket")
        if (OutputBasket.numInstances > 0) throw new Error("Can have only one single OutputBasket!") 
        OutputBasket.numInstances++
    } 

    public emptyBasket(): void {
        this.workItemBasket = []
    }


    private statsOfArrivedWorkitemsBetween(fromTime: Timestamp, toTime: Timestamp): I_EndProductStatistics {
        const invWisStats: I_EndProductStatistics[] = []
        const wisArrived = this.workItemBasket.filter(wi => wi.hasMovedToOutputBasketBetween(fromTime, toTime))  //  all workitems that have transitioned into output basket after fromTime and up to toTime

        const emptyWorkItemInInventoryStatistics = {
            numWis:             0,
            normEffort:         0,
            elapsedTime:        0,
            netValueAdd:        0,
            discountedValueAdd: 0
        }

        if (wisArrived.length < 1) return emptyWorkItemInInventoryStatistics

        for (let wi of wisArrived) {  // process all workitems that have transitioned into output basket after fromTime and up to toTime
            const normEffort            = wi.log[0].valueChain.processSteps.map(ps => ps.normEffort).reduce((e1, e2) => e1 + e2)  // == minimum cycle time thru value chain
            const minCycleTime          = normEffort    
            const elapsedTime           = wi.elapsedTime(ElapsedTimeMode.firstToLastEntryFound)
            const netValueAdd           = wi.log[0].valueChain.totalValueAdd
            const discountedValueAdd    = wi.log[0].valueChain.value_degration!(netValueAdd, elapsedTime - minCycleTime)
            invWisStats.push(
                {
                    numWis:             1,
                    normEffort:         normEffort,
                    elapsedTime:        elapsedTime,
                    netValueAdd:        netValueAdd,
                    discountedValueAdd: discountedValueAdd 
                })
        }
        const wiBasedStats = invWisStats.reduce(
            (iws1, iws2) => { return {
                numWis:             iws1.numWis             + iws2.numWis,
                normEffort:         iws1.normEffort         + iws2.normEffort,  
                elapsedTime:        iws1.elapsedTime        + iws2.elapsedTime,
                netValueAdd:        iws1.netValueAdd        + iws2.netValueAdd,
                discountedValueAdd: iws1.discountedValueAdd + iws2.discountedValueAdd }}, 
            emptyWorkItemInInventoryStatistics)

        return wiBasedStats
    }
    

    public endProductMoreStatistics(fromTime: Timestamp, toTime: Timestamp): I_EndProductMoreStatistics {
        //type TimeValueOf = (value: Value, time: TimeUnit) => number
        //const timeValueOf = expired.bind(null, 3)
        //const timeValueOf = discounted.bind(null, 0.1)
        
        // --- calculating figures for end products in the output basket ---

        const wiBasedStats = this.statsOfArrivedWorkitemsBetween(fromTime, toTime)
        
        return {
            ...wiBasedStats,
            avgElapsedTime: wiBasedStats.elapsedTime / (wiBasedStats.numWis > 0 ? wiBasedStats.numWis : 1),  
//            roce:           wiBasedStats.discountedValueAdd / avgWorking  // ### have to calculate the avg. working capital between fromTime and toTime 
        }
    }

    public stringified  = () => `t=${clock.time} ${this.id}:\n` + this.stringifyBasketItems()
}
