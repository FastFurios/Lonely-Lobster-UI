//----------------------------------------------------------------------
//    VALUE CHAIN 
//----------------------------------------------------------------------
import { clock, outputBasket } from './_main.js'
import { idIter } from './workitem.js'
import { WorkItemBasketHolder, ProcessStep } from './workitembasketholder.js'
import { WorkItem } from './workitem.js'

type ValueChainId   = string
export type Value   = number // measured in Worker Time Units

export class ValueChain {
    public processSteps: ProcessStep[] = []

    constructor(public id:              ValueChainId,
                public totalValueAdd:   Value) {
    }

    public appendProcessStep(ps: ProcessStep) {
        this.processSteps.push(ps)
    }    

    public createAndInjectNewWorkItem(): WorkItem { 
        const wi = new WorkItem(idIter.next().value, this, this.processSteps[0])
        this.processSteps[0].addToBasket(wi)
        return wi
    }

    private nextWorkItemBasketHolder(ps: ProcessStep): WorkItemBasketHolder {
        const psi = this.processSteps.indexOf(ps) 
        return psi == this.processSteps.length - 1 ? outputBasket : this.processSteps[psi + 1]
    }

    public moveWorkItemToNextWorkItemBasketHolder(wi: WorkItem): void {
        (<ProcessStep>wi.currentProcessStep).removeFromBasket(wi)
        const nextProcessStep: WorkItemBasketHolder = this.nextWorkItemBasketHolder(<ProcessStep>wi.currentProcessStep) 
        wi.currentProcessStep = nextProcessStep
        nextProcessStep.addToBasket(wi)
        //console.log(">>>> moveWorkItemToNextWorkItemBasketHolder: wi=" + wi.id + " to-basket=" + nextProcessStep.id)
    }

    public letWorkItemsFlow = (): void => 
        this.processSteps.forEach(ps =>         // for all process steps in the value chain 
            ps.workItemBasket                   
                .filter(wi => wi.finishedAtCurrentProcessStep())                   // filter the workitems ready to be moved on
                .forEach(wi => this.moveWorkItemToNextWorkItemBasketHolder(wi)))   // move these workitems on

    public stringifyDetail(): string {
        let s: string = `t=${clock.time} vc=${this.id}:\n`
        for (let ps of this.processSteps) {
            s += ps.stringify()
        }
        return s
    }

    public stringifyHeader(): string {
        const stringifyColumnHeader = (wibh: WorkItemBasketHolder): string => `_${this.id}.${wibh.id}${"_".repeat(21)}`.substring(0, 20)
        return this.processSteps.map(ps => stringifyColumnHeader(ps)).reduce((a, b) => a + "|" + b)  
    } 
    
    public stringifyRow(): string {
        const showBar = (len: number): string => '#'.repeat(len).padEnd(20, ' ')
        return this.processSteps.map(ps => showBar(ps.workItemBasket.length)).reduce((a, b) => a + "|" + b)  
    } 
}
