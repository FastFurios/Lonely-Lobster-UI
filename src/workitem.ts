//----------------------------------------------------------------------
//    WORK ITEM  
//----------------------------------------------------------------------
//-- work item: at the beginning it is typically an order, in its final state it is the end-product / service ------------------------------------------------------------------------
import { TimeUnit, Timestamp } from './clock.js'
import { clock, outputBasket } from './_main.js'
import { ValueChain } from './valuechain.js'
import { WorkItemBasketHolder, ProcessStep, Effort } from './workitembasketholder.js'
import { LogEntry, LogEntryType } from './logging.js'
import { Worker } from './worker.js'


//----------------------------------------------------------------------
//    HELPERS 
//----------------------------------------------------------------------

export type WorkItemId = number

export interface WorkOrder {
    timestamp:  Timestamp,
    valueChain: ValueChain
}

// unique workitem identifier
function* workItemIdGenerator(): IterableIterator<WorkItemId> { for(let i = 0; true; i++) yield i }
export const idGen = workItemIdGenerator()

// workitem tags for display: lower letter = untouched, upper letter = some work already exerted
type WorkItemTag = [string, string]
const wiTags: WorkItemTag[] = [
    ["a", "A"],
    ["b", "B"],
    ["c", "C"],
    ["d", "D"],
    ["e", "E"],
    ["f", "F"],
    ["g", "G"],
    ["h", "H"],
    ["i", "I"],
    ["j", "J"],
    ["k", "K"],
    ["l", "L"],
    ["m", "M"],
    ["n", "N"],
    ["o", "O"],
    ["p", "P"],
    ["q", "Q"],
    ["r", "R"],
    ["s", "S"],
    ["t", "T"],
    ["u", "U"],
    ["v", "V"],
    ["w", "W"],
    ["x", "X"],
    ["y", "Y"],
    ["z", "Z"]
]  

function* wiTagGenerator(wiTags: WorkItemTag[]): IterableIterator<WorkItemTag> {
    for (let i = 0; true; i = i < wiTags.length - 1 ? i + 1 : 0) 
        yield wiTags[i] 
}
export const tagGen = wiTagGenerator(wiTags)

//----------------------------------------------------------------------
//    WORK ITEM LOGGING 
//----------------------------------------------------------------------

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

export enum ElapsedTimeMode {
    firstToLastEntryFound,   // timestamp of last entry found - timestamp of first entry found in workitem list
    firstEntryToNow          // clock.time - timestamp of first entry found in workitem list
}

export class WorkItem {
    private log:            LogEntryWorkItem[] = []
    public  id:             WorkItemId
    public  tag:            WorkItemTag
    public  extendedInfos:  WorkItemExtendedInfos

    constructor(public valueChain:          ValueChain,
                public currentProcessStep:  WorkItemBasketHolder) {
        this.id             = idGen.next().value
        this.tag            = tagGen.next().value
        this.extendedInfos  = new WorkItemExtendedInfos(this)   
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

    public elapsedTime (mode: ElapsedTimeMode, workItemBasketHolder?: WorkItemBasketHolder): TimeUnit { 
        //if (this.id == 6) console.log(`elapsedTime(${workItemBasketHolder?.id}):`)
        const logInScope: LogEntryWorkItem[] = workItemBasketHolder == undefined ? this.log
                                                                                 : this.log.filter(le => le.workItemBasketHolder == workItemBasketHolder)
        if (logInScope.length == 0) return -1                                                                         
        //if (this.id == 6) logInScope.forEach(le => console.log(`${le.stringifyLeWi()}`))
        
        const maxTime   = mode == ElapsedTimeMode.firstEntryToNow ? clock.time : Math.max(logInScope[logInScope.length - 1].timestamp)
        const minTime   = logInScope[0].timestamp
        const deltaTime = maxTime - minTime
        //if (this.id == 6) console.log(`elapsedTime(${workItemBasketHolder?.id}): a = ${deltaTime}\n`)
        return deltaTime
    }

    public accumulatedEffort = (workItemBasketHolder?: WorkItemBasketHolder): Effort =>
        (workItemBasketHolder == undefined ? this.log 
                                           : this.log.filter(le => le.workItemBasketHolder == workItemBasketHolder))
        .filter(le => le.logEntryType == LogEntryType.workItemWorkedOn).length

    public hasBeenWorkedOnAtCurrentTime = (timestamp: Timestamp, ps?: ProcessStep): boolean  => 
        this.log.filter(le => (le.timestamp == timestamp && le.logEntryType == LogEntryType.workItemWorkedOn)).length > 0
    
    public workedOnAtCurrentProcessStep = (): boolean => 
        this.accumulatedEffort(<ProcessStep>this.currentProcessStep) > 0

    public finishedAtCurrentProcessStep = (): boolean => 
        this.accumulatedEffort(<ProcessStep>this.currentProcessStep) >= (<ProcessStep>this.currentProcessStep).normEffort

    public updateExtendedInfos(): void {
        this.extendedInfos = new WorkItemExtendedInfos(this)         
    }
    public stringify = (): string => `\tt=${clock.time} wi=${this.id} ps=${this.currentProcessStep.id} vc=${this.valueChain.id} et=${this.elapsedTime(ElapsedTimeMode.firstToLastEntryFound)} ae=${this.accumulatedEffort(this.currentProcessStep)} ${this.finishedAtCurrentProcessStep() ? "done" : ""}\n`

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

//----------------------------------------------------------------------
//    WORKITEM EXTENDED INFO   ...for workers' decision making 
//----------------------------------------------------------------------

export enum WiExtInfoElem {
    wiId                            =  0,

    accumulatedEffortInProcessStep  =  1,
    remainingEffortInProcessStep    =  2,
    accumulatedEffortInValueChain   =  3,
    remainingEffortInValueChain     =  4,

    visitedProcessSteps             =  5,
    remainingProcessSteps           =  6,

    valueOfValueChain               =  7,
    totalEffortInValueChain         =  8,
    contributionOfValueChain        =  9,

    sizeOfInventoryInProcessStep    = 10,

    elapsedTimeInProcessStep        = 11,
    elapsedTimeInValueChain         = 12

}

type wiDecisionInput = number  
export type WiExtInfoTuple = [WorkItem, wiDecisionInput, wiDecisionInput, wiDecisionInput, wiDecisionInput, wiDecisionInput, wiDecisionInput, wiDecisionInput, wiDecisionInput, wiDecisionInput, wiDecisionInput, wiDecisionInput, wiDecisionInput]

export class WorkItemExtendedInfos {
    public workOrderExtendedInfos: WiExtInfoTuple
    constructor(public wi: WorkItem) {
        let accumulatedEffortInProcessStep   = wi.accumulatedEffort(wi.currentProcessStep)
        let remainingEffortInProcessStep     = (<ProcessStep>wi.currentProcessStep).normEffort - accumulatedEffortInProcessStep
        let accumulatedEffortInValueChain    = wi.accumulatedEffort()
        let remainingEffortInValueChain      = wi.valueChain.processSteps.map(ps => (<ProcessStep>ps).normEffort).reduce((a, b) => a + b) - accumulatedEffortInValueChain

        let visitedProcessSteps              = (<ProcessStep>wi.currentProcessStep).valueChain.processSteps.indexOf(<ProcessStep>wi.currentProcessStep) + 1
        let remainingProcessSteps            = (<ProcessStep>wi.currentProcessStep).valueChain.processSteps.length - visitedProcessSteps
        
        let valueOfValueChain                = (<ProcessStep>wi.currentProcessStep).valueChain.totalValueAdd
        let totalEffortInValueChain          = accumulatedEffortInValueChain + remainingEffortInValueChain
        let contributionOfValueChain         = valueOfValueChain - totalEffortInValueChain

        let sizeOfInventoryInProcessStep     = (<ProcessStep>wi.currentProcessStep).workItemBasket.length

        let elapsedTimeInProcessStep         = wi.elapsedTime(ElapsedTimeMode.firstEntryToNow, wi.currentProcessStep)
        let elapsedTimeInValueChain          = wi.elapsedTime(ElapsedTimeMode.firstEntryToNow)

        this.workOrderExtendedInfos = [
            wi,
            accumulatedEffortInProcessStep,   
            remainingEffortInProcessStep,     
            accumulatedEffortInValueChain,   
            remainingEffortInValueChain,      
    
            visitedProcessSteps,              
            remainingProcessSteps,           
            
            valueOfValueChain,                
            totalEffortInValueChain,          
            contributionOfValueChain,         
    
            sizeOfInventoryInProcessStep,    
    
            elapsedTimeInProcessStep,         
            elapsedTimeInValueChain          
        ]
    }

    public show (wiId: number, time?: Timestamp): void { 
        if (this.wi.id == wiId) console.log(
            `\nExtended infos for work item #${wiId}|${this.wi.tag} before work in process step ${this.wi.currentProcessStep.id} at time ${clock.time}:\n`
            + `\taccumulatedEffortInProcessStep \t= ${this.workOrderExtendedInfos[WiExtInfoElem.accumulatedEffortInProcessStep]}\n`
            + `\tremainingEffortInProcessStep \t= ${this.workOrderExtendedInfos[WiExtInfoElem.remainingEffortInProcessStep]}\n`
            + `\taccumulatedEffortInValueChain \t= ${this.workOrderExtendedInfos[WiExtInfoElem.accumulatedEffortInValueChain]}\n`
            + `\tremainingEffortInValueChain \t= ${this.workOrderExtendedInfos[WiExtInfoElem.remainingEffortInValueChain]}\n`

            + `\tvisitedProcessSteps \t\t= ${this.workOrderExtendedInfos[WiExtInfoElem.visitedProcessSteps]}\n`
            + `\tremainingProcessSteps \t\t= ${this.workOrderExtendedInfos[WiExtInfoElem.remainingProcessSteps]}\n`

            + `\tvalueOfValueChain \t\t= ${this.workOrderExtendedInfos[WiExtInfoElem.valueOfValueChain]}\n`
            + `\ttotalEffortInValueChain \t= ${this.workOrderExtendedInfos[WiExtInfoElem.totalEffortInValueChain]}\n`
            + `\tcontributionOfValueChain \t= ${this.workOrderExtendedInfos[WiExtInfoElem.contributionOfValueChain]}\n`

            + `\tsizeOfInventoryInProcessStep \t= ${this.workOrderExtendedInfos[WiExtInfoElem.sizeOfInventoryInProcessStep]}\n`

            + `\telapsedTimeInProcessStep \t= ${this.workOrderExtendedInfos[WiExtInfoElem.elapsedTimeInProcessStep]}\n`
            + `\telapsedTimeInValueChain \t= ${this.workOrderExtendedInfos[WiExtInfoElem.elapsedTimeInValueChain]}\n`
        )
   }

   public static stringifiedHeader = (): string => "___wi___vc/ps___________aeps_reps_aevc_revc_vpss_rpss__vvc_tevc__cvc_sips_etps_etvc" 
   public stringifiedDataLine = (): string => `${this.wi.id.toString().padStart(4, ' ')}|${this.wi.tag[0]}: ` 
        + `${((<ProcessStep>this.wi.currentProcessStep).valueChain.id + "/" + this.wi.currentProcessStep.id).padEnd(15, ' ')}`

        + `${this.workOrderExtendedInfos[WiExtInfoElem.accumulatedEffortInProcessStep].toFixed().padStart(5, ' ')}`
        + `${this.workOrderExtendedInfos[WiExtInfoElem.remainingEffortInProcessStep].toFixed().padStart(5, ' ')}`
        + `${this.workOrderExtendedInfos[WiExtInfoElem.accumulatedEffortInValueChain].toFixed().padStart(5, ' ')}`
        + `${this.workOrderExtendedInfos[WiExtInfoElem.remainingEffortInValueChain].toFixed().padStart(5, ' ')}`

        + `${this.workOrderExtendedInfos[WiExtInfoElem.visitedProcessSteps].toFixed().padStart(5, ' ')}`
        + `${this.workOrderExtendedInfos[WiExtInfoElem.remainingProcessSteps].toFixed().padStart(5, ' ')}`

        + `${this.workOrderExtendedInfos[WiExtInfoElem.valueOfValueChain].toFixed().padStart(5, ' ')}`
        + `${this.workOrderExtendedInfos[WiExtInfoElem.totalEffortInValueChain].toFixed().padStart(5, ' ')}`
        + `${this.workOrderExtendedInfos[WiExtInfoElem.contributionOfValueChain].toFixed().padStart(5, ' ')}`

        + `${this.workOrderExtendedInfos[WiExtInfoElem.sizeOfInventoryInProcessStep].toFixed().padStart(5, ' ')}`

        + `${this.workOrderExtendedInfos[WiExtInfoElem.elapsedTimeInProcessStep].toFixed().padStart(5, ' ')}`
        + `${this.workOrderExtendedInfos[WiExtInfoElem.elapsedTimeInValueChain].toFixed().padStart(5, ' ')}`
    




}