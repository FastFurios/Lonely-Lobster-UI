//----------------------------------------------------------------------
//    SYSTEM
//----------------------------------------------------------------------

import { Timestamp } from './clock.js'
import { ValueChain } from './valuechain.js'
import { WorkItemBasketHolder } from './workitembasketholder.js'
import { Worker, AssignmentSet } from './worker.js'
import { clock, outputBasket } from './_main.js'
import { WorkOrder } from "./workitem"


export class LonelyLobsterSystem {
    public workOrderInFlow:  WorkOrder[] = []
    constructor(public id:                  string,
                public valueChains:         ValueChain[],
                public workers:             Worker[],
                public assignments:         AssignmentSet) {}

    public processWorkOrders(now: Timestamp, wos: WorkOrder[]): void {
        clock.setToNow(now)
        if (wos.length > 0) wos.forEach(w => w.valueChain.createAndInjectNewWorkItem())
        
        this.workers.forEach(wo => wo.work(this.assignments))
        this.valueChains.forEach(vc => vc.letWorkItemsFlow())

        const stats = new WorkItemStats(outputBasket)
        this.showLine()
    }

    public showHeader = () => console.log("_t_||" + this.valueChains.map(vc => vc.stringifyHeader()).reduce((a, b) => a + "||" + b) + "||_#outs__CT:[min___avg___max]____TP#__TP$") 

    private showLine = () => console.log(clock.time.toString().padStart(3, ' ') + "||" 
                                       + this.valueChains.map(vc => vc.stringifyRow()).reduce((a, b) => a + "||" + b) + "||" 
                                       + outputBasket.workItemBasket.length.toString().padStart(6, " ") + " " 
                                       + new WorkItemStats(outputBasket).show())

    public showFooter = () => { 
        console.log("Utilization of:")
        this.workers.forEach(wo => console.log(`${wo.id.padEnd(10, " ")} ${(wo.log.length / (clock.time - clock.startTime + 1) * 100).toFixed(1).padStart(4, ' ')}%\t` 
                                                + `${this.assignments.assignments.filter(a => a.worker.id == wo.id).map(a => a.valueChainProcessStep.valueChain.id + "." + a.valueChainProcessStep.processStep.id).reduce((a, b) => a + ", " + b)      } `))
    }                               
}


//----------------------------------------------------------------------
//    STATISTICS
//----------------------------------------------------------------------

interface WorkItemStatsCycleTime {
    min: number,
    avg: number,
    max: number
}

interface WorkItemStatsThroughput {
    itemPerTimeUnit:    number,
    valuePerTimeUnit:   number
}


class WorkItemStats {
    public hasCalculatedStats: boolean = false
    public cycleTime:  WorkItemStatsCycleTime  = { min: 0, max: 0, avg: 0 }
    public throughput: WorkItemStatsThroughput = { itemPerTimeUnit: 0, valuePerTimeUnit: 0 }

    constructor(wibh: WorkItemBasketHolder) {
        this.hasCalculatedStats = wibh.workItemBasket.length > 0
        if (this.hasCalculatedStats) {
            const sortedWorkBasket = wibh.workItemBasket.sort((wi1, wi2) => wi1.elapsedTime() - wi2.elapsedTime())
            this.cycleTime.min = sortedWorkBasket[0].elapsedTime()
            this.cycleTime.max = sortedWorkBasket[sortedWorkBasket.length - 1].elapsedTime()
            this.cycleTime.avg = sortedWorkBasket.map(wi => wi.elapsedTime()).reduce((a, b) => a + b) / sortedWorkBasket.length

            this.throughput.itemPerTimeUnit  = wibh.workItemBasket.length / clock.time
            this.throughput.valuePerTimeUnit = wibh.workItemBasket.map(wi => wi.valueChain.totalValueAdd).reduce((a, b) => a + b)  / clock.time
        }
    }
    public show = (): string => this.hasCalculatedStats 
                                ? `    ${this.cycleTime.min.toFixed(1).padStart(4, ' ')}  ${this.cycleTime.avg.toFixed(1).padStart(4, ' ')}  ${this.cycleTime.max.toFixed(1).padStart(4, ' ')}    ${this.throughput.itemPerTimeUnit.toFixed(1).padStart(4, ' ')} ${this.throughput.valuePerTimeUnit.toFixed(1).padStart(4, ' ')}`
                                : ""  

}

