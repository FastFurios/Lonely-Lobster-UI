//----------------------------------------------------------------------
//    VALUE CHAIN 
//----------------------------------------------------------------------
import { outputBasket } from './_main.js'
import { WorkItem } from './workitem.js'
import { WorkItemBasketHolder, ProcessStep } from './workitembasketholder.js'

type ValueChainId   = string
export type Value   = number // measured in Worker Time Units

export class ValueChain {
    public processSteps: ProcessStep[] = []

    constructor(public id:              ValueChainId,
                public totalValueAdd:   Value) {
    }

    private appendProcessStep(ps: ProcessStep): void {
        this.processSteps.push(ps)
    }    

    public createAndInjectNewWorkItem(): void { 
        const wi = new WorkItem(this, this.processSteps[0])
        this.processSteps[0].addToBasket(wi)
    }

    private nextWorkItemBasketHolder(ps: ProcessStep): WorkItemBasketHolder {
        const psi = this.processSteps.indexOf(ps) 
        return psi == this.processSteps.length - 1 ? outputBasket : this.processSteps[psi + 1]
    }

    private moveWorkItemToNextWorkItemBasketHolder(wi: WorkItem): void {
        (<ProcessStep>wi.currentProcessStep).removeFromBasket(wi)
        const nextProcessStep: WorkItemBasketHolder = this.nextWorkItemBasketHolder(<ProcessStep>wi.currentProcessStep) 
        wi.currentProcessStep = nextProcessStep
        nextProcessStep.addToBasket(wi)
    }

    public updateWorkItemExtendedInfos = (): void => this.processSteps.forEach(ps => ps.workItemBasket.forEach(wi => wi.updateExtendedInfos()))

    public letWorkItemsFlow = (): void => 
        this.processSteps.forEach(ps =>                                             // for all process steps in the value chain 
            ps.workItemBasket                   
                .filter(wi => wi.finishedAtCurrentProcessStep())                    // filter the workitems ready to be moved on
                .forEach(wi => this.moveWorkItemToNextWorkItemBasketHolder(wi)))    // move these workitems on

    public stringifiedHeader(): string {
        const stringifyColumnHeader = (wibh: ProcessStep): string => `_${this.id}.${wibh.id}${"_".repeat(wibh.barLen)}`.substring(0, wibh.barLen)
        return this.processSteps.map(ps => stringifyColumnHeader(ps)).reduce((a, b) => a + "|" + b)  
    } 
    
    public stringifiedRow = (): string => this.processSteps.map(ps => ps.stringifiedBar()).reduce((a, b) => a + "|" + b)  
}
