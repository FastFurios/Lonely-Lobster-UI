//----------------------------------------------------------------------
//    SYSTEM
//----------------------------------------------------------------------

import { clock, lonelyLobsterSystem, outputBasket } from './_main.js'
import { Timestamp, TimeUnit } from './clock.js'
import { reshuffle } from './helpers.js'
import { Value, ValueChain } from './valuechain.js'
import { ProcessStep } from './workitembasketholder.js'
import { Worker, AssignmentSet } from './worker.js'
import { WorkOrder, StatsEventForExitingAProcessStep, WorkItem, ElapsedTimeMode } from "./workitem.js"
import { I_SystemStatistics, I_ValueChainStatistics, I_ProcessStepStatistics, I_WorkItemStatistics, ProcessStepId, ValueChainId } from './io_api_definitions.js'

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

export function systemStatistics(sys: LonelyLobsterSystem, fromTime: Timestamp, toTime: Timestamp): I_SystemStatistics {

    interface WiElapTimeValAdd {
        wi:             WorkItem
        valueAdd:       Value
        elapsedTime:    Timestamp
    }

    function workItemStatistics(wiElapTimeValAdd: WiElapTimeValAdd[], interval: TimeUnit): I_WorkItemStatistics {
        const elapsedTimes: TimeUnit[] = wiElapTimeValAdd.flatMap(el => el.elapsedTime)
        const hasCalculatedStats = elapsedTimes.length > 0
        return {
            hasCalculatedStats: hasCalculatedStats,
            throughput: {
                itemsPerTimeUnit: wiElapTimeValAdd.length / interval,
                valuePerTimeUnit: wiElapTimeValAdd.map(el => el.valueAdd).reduce((va1, va2) => va1 + va2, 0) / interval
            },
            cycleTime: {
                min: hasCalculatedStats ? elapsedTimes.reduce((a, b) => a < b ? a : b)               : undefined,
                avg: hasCalculatedStats ? elapsedTimes.reduce((a, b) => a + b) / elapsedTimes.length : undefined,
                max: hasCalculatedStats ? elapsedTimes.reduce((a, b) => a > b ? a : b)               : undefined
            }
        } 
    }

    function obStatistics(ses: StatsEventForExitingAProcessStep[], interval: TimeUnit): I_WorkItemStatistics {
        const sesOfOb = ses.filter(se => se.psEntered == outputBasket)
        const wiElapTimeValAdd: WiElapTimeValAdd[] = sesOfOb.map(se => { 
            return { 
                wi:          se.wi,
                valueAdd:    se.vc.totalValueAdd,
                elapsedTime: se.finishedTime - se.injectionIntoValueChainTime 
            }
        })
        /* tbd */ //elapsedTimesWithValueAdd.forEach(et => console.log("OB: wi=" + et.wi.id + "/" + et.wi.tag[0] + ": va= " + et.valueAdd + ", et= " + et.elapsedTime))
        return workItemStatistics(wiElapTimeValAdd, interval)
    }

    function psStatistics(ses: StatsEventForExitingAProcessStep[], vc: ValueChain, ps: ProcessStep, interval: TimeUnit): I_ProcessStepStatistics {
//        console.log("psStatistics(vc=" + vc.id + ", ps=" + ps.id + ").ses.length=" + ses.length)                                

        const wiElapTimeValAddOfVcPs: WiElapTimeValAdd[] = ses.filter(se => se.vc == vc && se.psExited == ps)
                                                .map(se => { return {
                                                    wi:          se.wi,
                                                    valueAdd:    se.vc.totalValueAdd,
                                                    elapsedTime: se.elapsedTime
                                                }})
//        console.log(".elapsedTimesWithValueAdd=")                                
//        console.log(elapsedTimesWithValueAdd)                                
        return {
            id: ps.id,
            stats: workItemStatistics(wiElapTimeValAddOfVcPs, interval)
        }
    }

    function vcStatistics(ses: StatsEventForExitingAProcessStep[], vc: ValueChain, interval: TimeUnit): I_ValueChainStatistics {
    /*
        function vcOverallStatistics(ses: StatsEventForExitingAProcessStep[], vc: ValueChain): I_WorkItemStatistics {
            const elapsedTimesWithValueAdd: ElapsedTimeWithValueAdd[] = ses.filter(se => se.vc == vc && se.psEntered == outputBasket)
                                            .map(se => { return {
                                                wi:          se.wi,
                                                valueAdd:    se.vc.totalValueAdd,
                                                elapsedTime: se.elapsedTime
                                            }})
            return workItemStatistics(elapsedTimesWithValueAdd)
        }
    */    
        const sesOfVc = ses.filter(se => se.vc == vc && se.psEntered == outputBasket)
        const wiElapTimeValAddOfVc: WiElapTimeValAdd[] = sesOfVc.map(se => { 
            return {
                wi:          se.wi,
                valueAdd:    se.vc.totalValueAdd,
                elapsedTime: se.finishedTime - se.injectionIntoValueChainTime
            }
        })
        //elapsedTimesWithValueAdd.forEach(el => console.log("va=" + el.valueAdd + ", et=" + el.elapsedTime))

        return {
            id: vc.id,
            stats: {
                vc:     workItemStatistics(wiElapTimeValAddOfVc, interval),
                pss:    vc.processSteps.map(ps => psStatistics(ses, vc, ps, interval))
            }
        }
    }
    //console.log("\n\nsystem.systemStistics() -- clock.time= " + clock.time + " ----------------------")
    const interval:TimeUnit = toTime - fromTime
    const statEvents: StatsEventForExitingAProcessStep[] = sys.valueChains.flatMap(vc => vc.processSteps.flatMap(ps => ps.stats(fromTime, toTime)))
                                                          .concat(outputBasket.stats(fromTime, toTime))

    /* tbd */ //console.log("statEvents =")                                                          
    /* tbd */ //statEvents.forEach(se => console.log(clock.time + ": " + se.wi.id + "/" + se.wi.tag[0] + " vc/ps=" + se.vc.id + " " + se.psExited.id + "=>" + se.psEntered.id + " \t\tinj= " + se.injectionIntoValueChainTime + " fin= " +  se.finishedTime + " elap= " + se.elapsedTime))                       

    //console.log("system.systemStatistics() List of wis with excerted efforts:")
    //sys.valueChains.forEach(vc => vc.processSteps
    //               .forEach(ps => ps.workItemBasket
    //               .forEach(wi => console.log("   wi.id= " + wi.id + " accum.effort=" + wi.accumulatedEffort()))))

    return {
        outputBasket: {
            flow: obStatistics(statEvents, interval),
            inventory: outputBasket.inventoryStats(ElapsedTimeMode.firstEntryToNow)
        },
        valueChains:  sys.valueChains.map(vc => vcStatistics(statEvents, vc, interval)),
        workingCapital: sys.valueChains.map(vc => vc.accumulatedEffortMade()).reduce((ef1, ef2) => ef1 + ef2)
    } 
}

function obStatsAsString(rollingWindowSize: TimeUnit = clock.time): string {
    const stats: I_WorkItemStatistics = systemStatistics(lonelyLobsterSystem, clock.time - rollingWindowSize, clock.time).outputBasket.flow
    return `    ${stats.cycleTime.min?.toFixed(1).padStart(4, ' ')}  ${stats.cycleTime.avg?.toFixed(1).padStart(4, ' ')}  ${stats.cycleTime.max?.toFixed(1).padStart(4, ' ')}     ${stats.throughput.itemsPerTimeUnit?.toFixed(1).padStart(4, ' ')}   ${stats.throughput.valuePerTimeUnit?.toFixed(1).padStart(4, ' ')}`
//  return "- tbd: intentionally left empty -"
}
