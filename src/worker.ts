//----------------------------------------------------------------------
//    WORKERS 
//----------------------------------------------------------------------

import { clock, debugShowOptions } from './_main.js'
import { Timestamp } from './clock.js'
import { topElemAfterSort, SortVector } from "./helpers.js"
import { LogEntry, LogEntryType } from './logging.js'
import { ValueChain } from './valuechain.js'
import { WorkItem, WiExtInfoElem, WiExtInfoTuple, WorkItemExtendedInfos } from './workitem.js'
import { ProcessStep } from './workitembasketholder.js'


//----------------------------------------------------------------------
//    WORKER BEHAVIOUR 
//----------------------------------------------------------------------

export function selectNextWorkItemBySortVector(wis: WorkItem[], svs: SortVector[]): WorkItem { // take the top-ranked work item after sorting the accessible work items
    const extInfoTuples: WiExtInfoTuple[] = wis.map(wi => wi.extendedInfos.workOrderExtendedInfos) 
    const selectedWi: WiExtInfoTuple = topElemAfterSort(extInfoTuples, svs)
    return selectedWi[WiExtInfoElem.workItem]  // return workitem object reference
} 

//----------------------------------------------------------------------
//    WORKER LOGGING 
//----------------------------------------------------------------------

class LogEntryWorker extends LogEntry {
    constructor(public worker: Worker) {
        super(LogEntryType.workerWorked)
    }

    public stringified = (): string => `${this.stringifiedLe()}, ${this.logEntryType}, wo=${this.worker.id}` 
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

/*
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
*/
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
                private sortVectorSequence: SortVector[]) {}

    private logWorked(): void { this.log.push(new LogEntryWorker(this)) }

    private  workItemsAtHand(asSet: AssignmentSet): WorkItem[] {
        const pss: ProcessStep[] = asSet.assignments.filter(as => as.worker.id == this.id).map(as => as.valueChainProcessStep.processStep)
        return pss.flatMap(ps => ps.workItemBasket) 
    }

    private hasWorkedAt = (timestamp: Timestamp): boolean => this.log.filter(le => le.timestamp == timestamp).length > 0

    public work(asSet: AssignmentSet): void {
        if (this.hasWorkedAt(clock.time)) return    // worker has already worked at current time

        const workableWorkItemsAtHand: WorkItem[] = this.workItemsAtHand(asSet)
                                                    .filter(wi => !wi.finishedAtCurrentProcessStep())               // not yet in OutputBasket
                                                    .filter(wi => !wi.hasBeenWorkedOnAtCurrentTime(clock.time))     // no one worked on it at current time

        if (workableWorkItemsAtHand.length == 0) return // no workable workitems at hand

        if(debugShowOptions.workerChoices) console.log("Worker__" + WorkItemExtendedInfos.stringifiedHeader())
        if(debugShowOptions.workerChoices) workableWorkItemsAtHand.forEach(wi => console.log(`${this.id.padEnd(6, ' ')}: ${wi.extendedInfos.stringifiedDataLine()}`)) // ***

        const wi: WorkItem = selectNextWorkItemBySortVector(workableWorkItemsAtHand, this.sortVectorSequence)

        if(debugShowOptions.workerChoices) console.log(`=> ${this.id} picked: ${wi.id}|${wi.tag[0]}`)

        wi.logWorkedOn(this)
        this.logWorked()
    }

/*
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
            s += `\t${le.stringified()}\n` 
        }
        return s 
    } 
*/
}
