//----------------------------------------------------------------------
//    SYSTEM
//----------------------------------------------------------------------

import { Timestamp, TimeUnit } from './clock.js'
import { ValueChain } from './valuechain.js'
import { WorkItemBasketHolder } from './workitembasketholder.js'
import { Worker, AssignmentSet } from './worker.js'
import { clock, DebugShowOptions, outputBasket } from './_main.js'
import { WorkOrder, ElapsedTimeMode } from "./workitem.js"
import { reshuffle } from './helpers.js'
import { DebugLogger } from 'util'

export class LonelyLobsterSystem {
    public workOrderInFlow:  WorkOrder[] = []
    constructor(public id:                  string,
                public valueChains:         ValueChain[],
                public workers:             Worker[],
                public assignmentSet:       AssignmentSet) {}

    public doNextIteration(now: Timestamp, wos: WorkOrder[]): void {
        clock.setToNow(now)
        // populate process steps with work items (and first process steps with new work orders)
        this.valueChains.forEach(vc => vc.letWorkItemsFlow())
        if (wos.length > 0) wos.forEach(w => w.valueChain.createAndInjectNewWorkItem())

        // prepare workitem extended statistical infos before workers make their choice 
        this.valueChains.forEach(vc => vc.processSteps.forEach(ps => ps.workItemBasket.forEach(wi => wi.updateExtendedInfos())))

        // workers select workitems and work them
        this.workers = reshuffle(this.workers) // avoid that work is assigned to workers always in the same worker sequence  
        this.workers.forEach(wo => wo.work(this.assignmentSet))
 
        // show valuechains line for current time
        this.showLine()
    }

    public showHeader = () => console.log("_t_||" + this.valueChains.map(vc => vc.stringifyHeader()).reduce((a, b) => a + "| |" + b) + "| _#outs__CT:[min___avg___max]_TP:[__#______$]") 

    private showLine = () => console.log(clock.time.toString().padStart(3, ' ') + "||" 
                                       + this.valueChains.map(vc => vc.stringifyRow()).reduce((a, b) => a + "| |" + b) + "| " 
                                       + outputBasket.workItemBasket.length.toString().padStart(6, " ") + " " 
                                       + new WorkItemStats(outputBasket, 5).show())

    public showFooter = () => { 
        console.log("_t_||" + this.valueChains.map(vc => vc.stringifyHeader()).reduce((a, b) => a + "| |" + b) + "| "
        + outputBasket.workItemBasket.length.toString().padStart(6, " ") + " " 
        + new WorkItemStats(outputBasket).show())
        console.log("Utilization of:")
        this.workers.forEach(wo => console.log(`${wo.id.padEnd(10, " ")} ${(wo.log.length / (clock.time - clock.startTime + 1) * 100).toFixed(1).padStart(4, ' ')}%\t` 
                                                + `${this.assignmentSet.assignments.filter(a => a.worker.id == wo.id).map(a => a.valueChainProcessStep.valueChain.id + "." + a.valueChainProcessStep.processStep.id).reduce((a, b) => a + ", " + b)      } `))
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

    constructor(wibh: WorkItemBasketHolder, rollingWindowSize: TimeUnit = clock.time) {
        const filteredWorkBasket = wibh.workItemBasket.filter(wi => wi.timeOfLastLogEntry() > clock.time - rollingWindowSize)
        const sortedWorkBasket   = filteredWorkBasket.sort((wi1, wi2) => wi1.elapsedTime(ElapsedTimeMode.firstToLastEntryFound) - wi2.elapsedTime(ElapsedTimeMode.firstToLastEntryFound))

        this.hasCalculatedStats = sortedWorkBasket.length > 0
        if (this.hasCalculatedStats) {
            this.cycleTime.min = sortedWorkBasket[0].elapsedTime(ElapsedTimeMode.firstToLastEntryFound)
            this.cycleTime.max = sortedWorkBasket[sortedWorkBasket.length - 1].elapsedTime(ElapsedTimeMode.firstToLastEntryFound)
            this.cycleTime.avg = sortedWorkBasket.map(wi => wi.elapsedTime(ElapsedTimeMode.firstToLastEntryFound)).reduce((a, b) => a + b) / sortedWorkBasket.length

            this.throughput.itemPerTimeUnit  = filteredWorkBasket.length / Math.min(rollingWindowSize, clock.time)
            this.throughput.valuePerTimeUnit = filteredWorkBasket.map(wi => wi.valueChain.totalValueAdd).reduce((a, b) => a + b)  / Math.min(rollingWindowSize, clock.time)
        }
    }
    public show = (): string => this.hasCalculatedStats 
                                ? `    ${this.cycleTime.min.toFixed(1).padStart(4, ' ')}  ${this.cycleTime.avg.toFixed(1).padStart(4, ' ')}  ${this.cycleTime.max.toFixed(1).padStart(4, ' ')}     ${this.throughput.itemPerTimeUnit.toFixed(1).padStart(4, ' ')}   ${this.throughput.valuePerTimeUnit.toFixed(1).padStart(4, ' ')}`
                                : ""  
}

