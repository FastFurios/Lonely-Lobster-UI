//----------------------------------------------------------------------
//    WORKERS 
//----------------------------------------------------------------------

import { Timestamp } from './clock.js'
import { clock, debugShowOptions } from './_main.js'
import { ProcessStep } from './workitembasketholder.js'
import { ValueChain } from './valuechain.js'
import { WorkItem, WiExtInfoElem, WiExtInfoTuple, WorkItemExtendedInfos } from './workitem.js'
import { LogEntry, LogEntryType } from './logging.js'
import { topElemAfterSort, SortVector, SelectionCriterion } from "./helpers.js"


//----------------------------------------------------------------------
//    WORKER BEHAVIOUR 
//----------------------------------------------------------------------
export function selectNextWorkItem_001(wis: WorkItem[]): WorkItem { // just take the first in the list of all accessible work items 
    return wis[0]
} 

export function selectNextWorkItem_002(wis: WorkItem[]): WorkItem { // take randomly a work item in the list of all accessible workitems
    const i = Math.floor(Math.random() * wis.length)
    return wis[i]
} 

export function selectNextWorkItem_003(wis: WorkItem[]): WorkItem { // take the top-ranked work item after sorting the accessible work items
    const sv: SortVector[] = [
        { colIndex: WiExtInfoElem.remainingProcessSteps, 
          selCrit: SelectionCriterion.min }, 
        { colIndex: WiExtInfoElem.remainingEffortInProcessStep, 
        selCrit: SelectionCriterion.min } 
      ]    
    const extInfoTuples: WiExtInfoTuple[] = wis.map(wi => wi.extendedInfos.workOrderExtendedInfos) 

    const selectedWi: WiExtInfoTuple = topElemAfterSort(extInfoTuples, sv)
    return selectedWi[0]  // return workitem
} 

//----------------------------------------------------------------------
//    WORKER LOGGING 
//----------------------------------------------------------------------

class LogEntryWorker extends LogEntry {
    constructor(public worker: Worker) {
        super(LogEntryType.workerWorked)
    }

    public stringify = () => `${this.stringifyLe()}, ${this.logEntryType}, wo=${this.worker.id}` 
} 

//----------------------------------------------------------------------
//    ASSIGNMENTS OF WORKERS TO PROCESS STEPS
//----------------------------------------------------------------------

export interface Assignment {
    valueChainProcessStep: valueChainProcessStep
    worker:                Worker
}

export class AssignmentSet {
    public assignments: Assignment[] = []
    constructor(public id: string) {}

    public addAssignment(as: Assignment) {
        this.assignments.push(as)
    }

    public removeAssignment(assignment: Assignment) {
        this.assignments = this.assignments.filter(as => as != assignment)  
    }

    public stringify(): string {
        let s: string = `t=${clock.time} Assignment set "${this.id}":\n`
        for (let as of this.assignments) {
            s += `wo=${as.worker.id} vc=${as.valueChainProcessStep.valueChain.id} ps=${as.valueChainProcessStep.processStep.id}\n` 
        }
        return s 
    }

}
//----------------------------------------------------------------------
//    WORKER 
//----------------------------------------------------------------------

type WorkerName = string

interface valueChainProcessStep {
    valueChain:  ValueChain,
    processStep: ProcessStep
}

export class Worker {
    log: LogEntryWorker[] = []

    constructor(public  id:                 WorkerName,
                private selectNextWorkItem: (wiSet: WorkItem[]) => WorkItem) {}

    public logWorked() { this.log.push(new LogEntryWorker(this)) }

    private  workItemsAtHand(asSet: AssignmentSet): WorkItem[] {
        const pss: ProcessStep[] = asSet.assignments.filter(as => as.worker.id == this.id).map(as => as.valueChainProcessStep.processStep)
        return pss.flatMap(ps => ps.workItemBasket) 
    }

    public hasWorkedAt = (timestamp: Timestamp): boolean => this.log.filter(le => le.timestamp == timestamp).length > 0

    public work(asSet: AssignmentSet): void {
        if (this.hasWorkedAt(clock.time)) { return } 

        const workableWorkItemsAtHand: WorkItem[] = this.workItemsAtHand(asSet)
                                                    .filter(wi => !wi.finishedAtCurrentProcessStep())  // not yet in OutputBasket
                                                    .filter(wi => !wi.hasBeenWorkedOnAtCurrentTime(clock.time))     // no one worked on it at current time

        if (workableWorkItemsAtHand.length == 0) { return } // no workable workitems at hand

        if(debugShowOptions.workerChoices) console.log("Worker__" + WorkItemExtendedInfos.stringifiedHeader())
        if(debugShowOptions.workerChoices) workableWorkItemsAtHand.forEach(wi => console.log(`${this.id.padEnd(6, ' ')}: ${wi.extendedInfos.stringifiedDataLine()}`)) // ***

        const wi = this.selectNextWorkItem(workableWorkItemsAtHand)

        if(debugShowOptions.workerChoices) console.log(`=> ${this.id} picked: ${wi.id}|${wi.tag[0]}`)


        wi.logWorkedOn(this)
        this.logWorked()
    }

    public show(asSet: AssignmentSet): string {
        let s = `t=${clock.time} wo=${this.id}: workitems at hand:\n`
        for (let wi of this.workItemsAtHand(asSet)) {
            s += wi.stringify()
        }
        return s
    }

    public stringifyLog(): string {
        let s: string = `t=${clock.time} Worker Log:\n`
        for (let le of this.log) {
            s += `\t${le.stringify()}\n` 
        }
        return s 
    } 
}
