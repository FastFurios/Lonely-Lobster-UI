//----------------------------------------------------------------------
//    WORK ITEM LOGGING 
//----------------------------------------------------------------------
//-- work item: at the beginning it is typically an order, in its final state it is the end-product / service ------------------------------------------------------------------------
import { TimeUnit, Timestamp } from './clock.js'
import { clock, outputBasket } from './_main.js'
import { ValueChain } from './valuechain.js'
import { WorkItemBasketHolder, ProcessStep, Effort } from './workitembasketholder.js'
import { LogEntry, LogEntryType } from './logging.js'
import { Worker } from './worker.js'

 
type WorkItemId = number

export interface WorkOrder {
    orderTime:  Timestamp,
    valueChain: ValueChain
}

// -- logging ------------------------

abstract class LogEntryWorkItem extends LogEntry {
    constructor(    public workItem:            WorkItem,       
                    public valueChain:          ValueChain, 
                    public workItemBasketHolder:WorkItemBasketHolder,
                           logEntryType:        LogEntryType) {
        super(logEntryType)
    }

    public stringifyLeWi = () => `${this.stringifyLe()}, ${this.logEntryType}, vc = ${this.valueChain.id}, ps = ${this.workItemBasketHolder == outputBasket ? "OutputBasket" : (<ProcessStep>this.workItemBasketHolder).id}, wi = ${this.workItem.id}`
} 

//      -- moved -- used also for "workitem created and injected" ---
export class LogEntryWorkItemMoved extends LogEntryWorkItem {
    constructor(       workItem:                   WorkItem,
                       valueChain:                 ValueChain, 
                       toWorkItemBasketHolder:     WorkItemBasketHolder) { 
        super(workItem, valueChain, toWorkItemBasketHolder, LogEntryType.workItemMovedTo)
    }

    public stringify = () => `${this.stringifyLeWi()}`
}

//      -- worked --
export class LogEntryWorkItemWorked extends LogEntryWorkItem {
    constructor(            workItem:                   WorkItem,
                            valueChain:                 ValueChain, 
                            processStep:                ProcessStep,
                     public worker:                     Worker) {
        super(workItem, valueChain, processStep, LogEntryType.workItemWorkedOn)
    }

    public stringify = () => `${this.stringifyLeWi()}, worker = ${this.worker.id}`
}

//----------------------------------------------------------------------
//    WORK ITEM  
//----------------------------------------------------------------------

function* workItemIdGenerator(): IterableIterator<WorkItemId> { for(let i = 0; true; i++) yield i }
export const idIter = workItemIdGenerator()

export class WorkItem {
    log: LogEntryWorkItem[] = []

    constructor(public id:                  WorkItemId, 
                public valueChain:          ValueChain,
                public currentProcessStep:  WorkItemBasketHolder) {
    }

    public logMovedTo(toProcessStep: WorkItemBasketHolder) {
        this.log.push(new LogEntryWorkItemMoved(    this,
                                                    this.valueChain, 
                                                    toProcessStep ))
    }

    public logWorkedOn(worker: Worker) {
        this.log.push(new LogEntryWorkItemWorked(   this,
                                                    this.valueChain, 
                                                    <ProcessStep>this.currentProcessStep,
                                                    worker ))
    }

    //public elapsedTime = (): TimeUnit => clock.time - this.log[0].timestamp
    public elapsedTime = (): TimeUnit => (this.log[this.log.length -1].timestamp < clock.time ? this.log[this.log.length -1].timestamp : clock.time) - this.log[0].timestamp

    public accumulatedEffort = (workItemBasketHolder?: WorkItemBasketHolder): Effort =>
        (workItemBasketHolder == undefined ? this.log 
                                           : this.log.filter(le => le.workItemBasketHolder == workItemBasketHolder))
        .filter(le => le.logEntryType == LogEntryType.workItemWorkedOn).length

    public hasBeenWorkedOn = (timestamp: Timestamp): boolean  => this.log.filter(le => (le.timestamp == timestamp && le.logEntryType == LogEntryType.workItemWorkedOn)).length > 0

    public finishedAtCurrentProcessStep = (): boolean => 
        this.accumulatedEffort(<ProcessStep>this.currentProcessStep) >= (<ProcessStep>this.currentProcessStep).normEffort

    public stringify = (): string => `\tt=${clock.time} wi=${this.id} ps=${this.currentProcessStep.id} vc=${this.valueChain.id} et=${this.elapsedTime()} ae=${this.accumulatedEffort(this.currentProcessStep)} ${this.finishedAtCurrentProcessStep() ? "done" : ""}\n`

    public stringifyLog(): string {
        let s: string = `t=${clock.time} WorkItem Log:\n`
        for (let le of this.log) {
            s += `${le.stringify()}\n` 
        }
        return s 
    } 
}

//----------------------------------------------------------------------
//    WORKITEM SET 
//----------------------------------------------------------------------
export class WorkItemSet {
   public workItemBasket: WorkItem[] = []
   constructor() {}
    
   public add = (ws: WorkItem): number => this.workItemBasket.push(ws)  

   public stringify = (): string => `WorkItem Set: t=${clock.time} wi[]=${this.workItemBasket.map(wi => wi.id.toString()).reduce((a, b) => a + " " + b)}\n`
}

