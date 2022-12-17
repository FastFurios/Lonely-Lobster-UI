//----------------------------------------------------------------------
//    WORKITEM BASKET HOLDER / PROCESS STEP 
//----------------------------------------------------------------------

import { clock } from './_main.js'
import { WorkItem } from './workitem.js'
import { ValueChain } from './valuechain.js'

export type Effort    = number // measured in Worker Time Units

export abstract class WorkItemBasketHolder {
    public workItemBasket: WorkItem[] = []

    constructor(public id: string) {}

    public addToBasket(workItem: WorkItem) { 
        this.workItemBasket.push(workItem) 
        workItem.logMovedTo(this)
    }

    public abstract stringify(): string

    public stringifyBasketItems = (): string => this.workItemBasket.length == 0 ? "empty" : this.workItemBasket.map(wi => "\t\t" + wi.stringify()).reduce((a, b) => a + " " + b)
}

//-- regular PROCESS STEP in a value chain

export class ProcessStep extends WorkItemBasketHolder  {
    constructor(       id:            string,
                public valueChain:    ValueChain,
                public normEffort:    Effort) {
        super(id)
    }

    public removeFromBasket(workItem: WorkItem) { 
        this.workItemBasket = this.workItemBasket.filter(wi => wi != workItem)  
    }

    public stringify = () => `\tt=${clock.time} basket of ps=${this.id} ne=${this.normEffort}:\n` + this.stringifyBasketItems()
}

//-- overall  OUTPUT BASKET (just one unique instance): here the total output of all value chains is collected over time

interface WorkItemStatsCycleTime {
    min: number,
    max: number,
    avg: number
}

export class OutputBasket extends WorkItemBasketHolder {
    static numInstances = 0
    constructor() { 
        if (OutputBasket.numInstances > 0) throw new Error("Can have only one single OutBasket!") 
        OutputBasket.numInstances++
        super("OutputBasket")
    } 

    public stringify  = () => `t=${clock.time} ${this.id}:\n` + this.stringifyBasketItems()
}
