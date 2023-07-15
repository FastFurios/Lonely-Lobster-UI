//----------------------------------------------------------------------
//    WORKITEM BASKET HOLDER
//----------------------------------------------------------------------

import { clock } from './_main.js'
import { Timestamp } from './clock.js'
import { ValueChain } from './valuechain.js'
import { WorkItem, StatsEventForFinishingAProcessStep } from './workitem.js'

export type Effort    = number // measured in Worker Time Units

export abstract class WorkItemBasketHolder {
    public workItemBasket: WorkItem[] = []

    constructor(public id: string, 
                public barLen: number = 20) {}

    public addToBasket(workItem: WorkItem) { 
        this.workItemBasket.push(workItem) 
        workItem.logMovedTo(this)
    }

    public stats(fromTime: Timestamp, toTime: Timestamp): StatsEventForFinishingAProcessStep[] {
        return this.workItemBasket.flatMap(wi => wi.statsEventsForFinishingAProcessSteps(fromTime, toTime))
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

    public stringified  = () => `t=${clock.time} ${this.id}:\n` + this.stringifyBasketItems()
}
