//----------------------------------------------------------------------
//    WORKERS 
//----------------------------------------------------------------------

import { Timestamp } from './clock.js'
import { clock } from './_main.js'
import { ProcessStep } from './workitembasketholder.js'
import { ValueChain } from './valuechain.js'
import { WorkItem } from './workitem.js'
import { LogEntry, LogEntryType } from './logging.js'


//----------------------------------------------------------------------
//    WORKER BEHAVIOUR 
//----------------------------------------------------------------------
export function selectNextWorkItem_001(wis: WorkItem[]): WorkItem {
    return wis[0]
} 

export function selectNextWorkItem_002(wis: WorkItem[]): WorkItem {
    const i = Math.floor(Math.random() * wis.length)
    return wis[i]
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

    public reshuffleArrayOrder(): void { // this is to avoid that more work is assigned to the first in the array for a process step than to subseqiuent workers  
        this.assignments = reshuffle<Assignment>(this.assignments)
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

        const wi = this.selectNextWorkItem(workableWorkItemsAtHand)
        wi.logWorkedOn(this)
        this.logWorked()
        //console.log(this.id + " has worked at t=" + clock.time + " on wi=" + wi.id + "/" + wi.tag[0])
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

//----------------------------------------------------------------------
//    BEHAVIOUR 
//----------------------------------------------------------------------

interface ArrayRow {
    row:  number,
    col1: number,
    col2: number
}

/*
const arr: ArrayRow[] = [
    {row: 0, col1: 10, col2: 500},
    {row: 1, col1: 20, col2: 400},
    {row: 2, col1: 30, col2: 300},
    {row: 3, col1: 40, col2: 200},
    {row: 4, col1: 50, col2: 100},
]

console.log(arr[1]["col1"])


type SortColVector = string[] 
const sortColVector: SortColVector = ["col1", "col2"]

function topOfsortedMultiCols(arr: ArrayRow[], sortColVec: SortColVector): ArrayRow[] {
    if (arr.length == 0)        return arr
    if (sortColVec.length == 0) return arr

    const lastColArr = arr.pop()  // arr now one shorter 
    const lastSortCol:string = <string>sortColVec.pop() // sortColVec now one shorter

    const allSortedButLastColArr: ArrayRow[] = topOfsortedMultiCols(arr, sortColVec) // sort the left columns

    return allSortedButLastColArr.sort((a: ArrayRow, b: ArrayRow) => b["col1"] - a["col1"])
}

console.log(topOfsortedMultiCols(arr, sortColVector))

*/