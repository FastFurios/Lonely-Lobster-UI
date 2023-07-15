//----------------------------------------------------------------------
//    SYSTEM
//----------------------------------------------------------------------

import { clock, lonelyLobsterSystem, outputBasket } from './_main.js'
import { Timestamp, TimeUnit } from './clock.js'
import { reshuffle } from './helpers.js'
import { Value, ValueChain } from './valuechain.js'
import { ProcessStep } from './workitembasketholder.js'
import { Worker, AssignmentSet } from './worker.js'
import { WorkOrder, ElapsedTimeMode, StatsEventForFinishingAProcessStep } from "./workitem.js"
import { WorkItemBasketHolder } from './workitembasketholder.js'
import { I_SystemStatistics, I_ValueChainStatistics, I_ProcessStepStatistics, I_WorkItemStatistics, ProcessStepId, ValueChainId } from './io_api_definitions.js'
import { min } from 'rxjs'


// tbd
let statEvents: StatsEventForFinishingAProcessStep[]


export class LonelyLobsterSystem {
    public workOrderInFlow:  WorkOrder[] = []
    constructor(public id:                  string,
                public valueChains:         ValueChain[],
                public workers:             Worker[],
                public assignmentSet:       AssignmentSet) {}

    public doNextIteration(now: Timestamp, wos: WorkOrder[]): void {
   
        clock.setTo(now)
        // populate process steps with work items (and first process steps with new work orders)
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

        // #### to be deleted ######
        const wiId = 2
        if (clock.time == 18) { 
        /*
            console.log("\n>> WORKITEM LOG" + outputBasket.workItemBasket[wiId].stringified())
            outputBasket.workItemBasket[wiId].log.filter(le => le.logEntryType == "movedTo").forEach(le => console.log(">> " + le.stringified()))
            outputBasket.workItemBasket[wiId].statsEventsForFinishingAProcessSteps().forEach(se => {
                console.log(">> t=" + se.finishedTime  + ", vc=" + se.vc.id + ", ps=" + se.ps.id + ", et=" + se.elapsedTime)
            })
            statEvents = this.valueChains.flatMap(vc => vc.processSteps.flatMap(ps => ps.stats(0, 100)))
            statEvents = statEvents.concat(outputBasket.stats(0,100))
        */
            console.log(">> systemStats(lonelyLobsterSystem).outputBasket=")
            console.log(systemStatistics(lonelyLobsterSystem).outputBasket)
            console.log(">> systemStats(lonelyLobsterSystem).valueChains=")
            systemStatistics(lonelyLobsterSystem).valueChains.forEach(vc => {
                console.log(vc.id)
                console.log(vc.stats.vc)
                vc.stats.pss.forEach(ps => {
                    console.log(ps.id)
                    console.log(ps.stats)
                })
            })
            //statEvents.forEach(se => console.log(">> wi=" + se.wi.id + "/" + se.wi.tag[0] + ", vc=" + se.vc.id + ", ps=" + se.ps.id + ", it=" + se.injectionIntoValueChainTime + ", ft=" + se.finishedTime  + ", et=" + se.elapsedTime))
        }
        //this.valueChains.forEach(vc => vc.processSteps.forEach(ps => console.log(ps.stats(0, 100))))
        // #########################

    }

    private headerForValueChains = ():string => "_t_||" + this.valueChains.map(vc => vc.stringifiedHeader()).reduce((a, b) => a + "| |" + b) +"| "

    public showHeader = () => console.log(this.headerForValueChains() + "_#outs__CT:[min___avg___max]_TP:[__#______$]") 

    private showLine = () => console.log(clock.time.toString().padStart(3, ' ') + "||" 
                                       + this.valueChains.map(vc => vc.stringifiedRow()).reduce((a, b) => a + "| |" + b) + "| " 
                                       + outputBasket.workItemBasket.length.toString().padStart(6, " ") + " " 
                                       + obStatsAsString(5))

    public showFooter = () => { 
        console.log(this.headerForValueChains()
        + outputBasket.workItemBasket.length.toString().padStart(6, " ") + " " 
        + obStatsAsString())
        console.log("Utilization of:")
        this.workers.forEach(wo => wo.utilization(this))
        this.workers.forEach(wo => console.log(`${wo.id.padEnd(10, " ")} ${wo.stats.utilization.toFixed(1).padStart(4, ' ')}%\t` 
            + wo.stats.assignments.map(a => a.valueChain.id + "." + a.processStep.id).reduce((a, b) => a + " / " + b)))
    }                               
}


//----------------------------------------------------------------------
//    STATISTICS
//----------------------------------------------------------------------

export function systemStatistics(sys: LonelyLobsterSystem): I_SystemStatistics {

    interface elapsedTimeWithValueAdd {
        valueAdd:       Value,
        elapsedTime:    Timestamp
    }

    function workItemStatistics(elapsedTimesWithValueAdd: elapsedTimeWithValueAdd[]): I_WorkItemStatistics {
        const elapsedTimes: TimeUnit[] = elapsedTimesWithValueAdd.flatMap(el => el.elapsedTime)
        return {
            hasCalculatedStats: true,
            throughput: {
                itemsPerTimeUnit: elapsedTimesWithValueAdd.length,
                valuePerTimeUnit: elapsedTimesWithValueAdd.map(el => el.valueAdd).reduce((va1, va2) => va1 + va2, 0)
            },
            cycleTime: {
                min: Math.min.apply(elapsedTimes),
                avg: elapsedTimes.reduce((a, b) => a + b, 0) / elapsedTimes.length,
                max: Math.max.apply(elapsedTimes)
            }
        } 
    }

    function obStatistics(ses: StatsEventForFinishingAProcessStep[]): I_WorkItemStatistics {
        const sesOfOb = ses.filter(se => se.psEntered == outputBasket)
        const elapsedTimesWithValueAdd = sesOfOb.map(se => { return { 
            valueAdd:    se.vc.totalValueAdd,
            elapsedTime: se.finishedTime - se.injectionIntoValueChainTime 
        }})
        return workItemStatistics(elapsedTimesWithValueAdd)
    }

    function psStatistics(ses: StatsEventForFinishingAProcessStep[], vc: ValueChain, ps: ProcessStep): I_ProcessStepStatistics {
        const elapsedTimesWithValueAdd = ses.filter(se => se.vc == vc && se.psLeft == ps)
                                        .map(se => { return {
                                            valueAdd:    se.vc.totalValueAdd,
                                            elapsedTime: se.finishedTime
                                        }})
        return {
            id: ps.id,
            stats: workItemStatistics(elapsedTimesWithValueAdd)
        }
    }

    function vcStatistics(ses: StatsEventForFinishingAProcessStep[], vc: ValueChain): I_ValueChainStatistics {
        function vcOverallStatistics(elapsedTimes: Timestamp[]): I_WorkItemStatistics {
            const elapsedTimesWithValueAdd = ses.filter(se => se.vc == vc && se.psEntered == outputBasket)
                                            .map(se => { return {
                                                valueAdd:    se.vc.totalValueAdd,
                                                elapsedTime: se.elapsedTime
                                            }})
            return workItemStatistics(elapsedTimesWithValueAdd)
        }
        const sesOfVc = ses.filter(se => se.vc == vc && se.psEntered == outputBasket)
        const elapsedTimesWithValueAdd = sesOfVc.map(se => { return {
                valueAdd:    se.vc.totalValueAdd,
                elapsedTime: se.finishedTime - se.injectionIntoValueChainTime
            }})
        return {
            id: vc.id,
            stats: {
                vc:     workItemStatistics(elapsedTimesWithValueAdd),
                pss:    vc.processSteps.map(ps => psStatistics(sesOfVc, vc, ps))
            }
        }
    }

    statEvents = sys.valueChains.flatMap(vc => vc.processSteps.flatMap(ps => ps.stats(0, 100)))
                    .concat(outputBasket.stats(0,100))
    return {
        outputBasket: obStatistics(statEvents),
        valueChains:  sys.valueChains.map(vc => vcStatistics(statEvents, vc))
    } 
}

function obStatsAsString(rollingWindowSize: TimeUnit = clock.time): string {
    const stats: I_WorkItemStatistics = systemStatistics(lonelyLobsterSystem).outputBasket
    return `    ${stats.cycleTime.min.toFixed(1).padStart(4, ' ')}  ${stats.cycleTime.avg.toFixed(1).padStart(4, ' ')}  ${stats.cycleTime.max.toFixed(1).padStart(4, ' ')}     ${stats.throughput.itemsPerTimeUnit.toFixed(1).padStart(4, ' ')}   ${stats.throughput.valuePerTimeUnit.toFixed(1).padStart(4, ' ')}`

}
