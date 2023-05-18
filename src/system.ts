//----------------------------------------------------------------------
//    SYSTEM
//----------------------------------------------------------------------

import { clock, outputBasket } from './_main.js'
import { Timestamp, TimeUnit } from './clock.js'
import { reshuffle } from './helpers.js'
import { ValueChain } from './valuechain.js'
import { Worker, AssignmentSet } from './worker.js'
import { WorkOrder, ElapsedTimeMode } from "./workitem.js"
import { WorkItemBasketHolder } from './workitembasketholder.js'


export class LonelyLobsterSystem {
    public workOrderInFlow:  WorkOrder[] = []
    constructor(public id:                  string,
                public valueChains:         ValueChain[],
                public workers:             Worker[],
                public assignmentSet:       AssignmentSet) {}

    public doNextIteration(now: Timestamp, wos: WorkOrder[]): void {
        //console.log("doNextIteration: now =", now)
        //console.log("doNextIteration: wos =")
        //console.log(wos)
   
        clock.setToNow(now)
        // populate process steps with work items (and first process steps with new work orders)
//      this.valueChains.forEach(vc => vc.processSteps.forEach(ps => console.log(ps.id + " had flow:" + ps.lastIterationFlowRate)))
        this.valueChains.forEach(vc => vc.processSteps.forEach(ps => ps.lastIterationFlowRate = 0))  // reset flow counters
        this.valueChains.forEach(vc => vc.letWorkItemsFlow())
        if (wos.length > 0) wos.forEach(w => w.valueChain.createAndInjectNewWorkItem())

        // prepare workitem extended statistical infos before workers make their choice 
        this.valueChains.forEach(vc => vc.processSteps.forEach(ps => ps.workItemBasket.forEach(wi => wi.updateExtendedInfos())))

        // workers select workitems and work them
        this.workers = reshuffle(this.workers) // avoid that work is assigned to workers always in the same worker sequence  
        this.workers.forEach(wo => wo.work(this.assignmentSet))
 
        // update workers stats after having worked
        this.workers.forEach(wo => wo.utilization(this))

        // show valuechains line for current time
        this.showLine()
    }

    private headerForValueChains = ():string => "_t_||" + this.valueChains.map(vc => vc.stringifiedHeader()).reduce((a, b) => a + "| |" + b) +"| "

    public showHeader = () => console.log(this.headerForValueChains() + "_#outs__CT:[min___avg___max]_TP:[__#______$]") 

    private showLine = () => console.log(clock.time.toString().padStart(3, ' ') + "||" 
                                       + this.valueChains.map(vc => vc.stringifiedRow()).reduce((a, b) => a + "| |" + b) + "| " 
                                       + outputBasket.workItemBasket.length.toString().padStart(6, " ") + " " 
                                       + workItemStats(outputBasket, 5))

    public showFooter = () => { 
        console.log(this.headerForValueChains()
        + outputBasket.workItemBasket.length.toString().padStart(6, " ") + " " 
        + workItemStats(outputBasket))
        console.log("Utilization of:")
        this.workers.forEach(wo => wo.utilization(this))
        this.workers.forEach(wo => console.log(`${wo.id.padEnd(10, " ")} ${wo.stats.utilization.toFixed(1).padStart(4, ' ')}%\t` 
            + wo.stats.assignments.map(a => a.valueChain.id + "." + a.processStep.id).reduce((a, b) => a + " / " + b)))
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

function workItemStats(wibh: WorkItemBasketHolder, rollingWindowSize: TimeUnit = clock.time): string {
    const cycleTime:            WorkItemStatsCycleTime  = { min: 0, max: 0, avg: 0 }
    const throughput:           WorkItemStatsThroughput = { itemPerTimeUnit: 0, valuePerTimeUnit: 0 }

    const filteredWorkBasket = wibh.workItemBasket.filter(wi => wi.timeOfLastLogEntry() > clock.time - rollingWindowSize)
    const sortedWorkBasket   = filteredWorkBasket.sort((wi1, wi2) => wi1.elapsedTime(ElapsedTimeMode.firstToLastEntryFound) - wi2.elapsedTime(ElapsedTimeMode.firstToLastEntryFound))

    const hasCalculatedStats = sortedWorkBasket.length > 0
    if (hasCalculatedStats) {
        cycleTime.min = sortedWorkBasket[0].elapsedTime(ElapsedTimeMode.firstToLastEntryFound)
        cycleTime.max = sortedWorkBasket[sortedWorkBasket.length - 1].elapsedTime(ElapsedTimeMode.firstToLastEntryFound)
        cycleTime.avg = sortedWorkBasket.map(wi => wi.elapsedTime(ElapsedTimeMode.firstToLastEntryFound)).reduce((a, b) => a + b) / sortedWorkBasket.length

        throughput.itemPerTimeUnit  = filteredWorkBasket.length / Math.min(rollingWindowSize, clock.time)
        throughput.valuePerTimeUnit = filteredWorkBasket.map(wi => wi.valueChain.totalValueAdd).reduce((a, b) => a + b)  / Math.min(rollingWindowSize, clock.time)
    }
    return hasCalculatedStats ? `    ${cycleTime.min.toFixed(1).padStart(4, ' ')}  ${cycleTime.avg.toFixed(1).padStart(4, ' ')}  ${cycleTime.max.toFixed(1).padStart(4, ' ')}     ${throughput.itemPerTimeUnit.toFixed(1).padStart(4, ' ')}   ${throughput.valuePerTimeUnit.toFixed(1).padStart(4, ' ')}`
                              : ""  
}
