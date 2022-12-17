// ########################################################################################################
//                                  LONELY LOBSTER
// a simulation of colaboration of workers in a company with multiple value chains
//      depending upon individual worker's strategies what to work on next 
//                          Gerold Lindorfer, Dec 2020 ff.
// ########################################################################################################

import { Clock } from './clock.js'
import { ProcessStep, OutputBasket } from './workitembasketholder.js'
import { ValueChain } from './valuechain.js'
import { LogEntryWorkItemWorked, WorkOrder } from './workitem.js'
import { LonelyLobsterSystem } from './system.js'
import { AssignmentSet, Worker, selectNextWorkItem_001 } from './worker.js'
import { LogEntryType } from './logging.js'

//----------------------------------------------------------------------
//    TEST CASES
//----------------------------------------------------------------------

/*
https://jstat.github.io/all.html#jStat.chisquare.pdf
jStat.chisquare.sample( dof )
Returns a random number whose distribution is the Chi Square distribution with dof degrees of freedom.

NodeJS & NPM
To install via npm:

npm install --save jstat
When loading under Node be sure to reference the child object.

var { jStat } = require('jstat').
*/

export const clock = new Clock()

export const outputBasket = new OutputBasket()

export const valueChains: ValueChain[]     = []
export const workers: Worker[]             = []

//-- create value chains with process steps
const blue = new ValueChain("Blue", 5)
const blue1 = new ProcessStep("b1", blue, 1)
const blue2 = new ProcessStep("b2", blue, 2)
blue.appendProcessStep(blue1)
blue.appendProcessStep(blue2)
valueChains.push(blue)

const green = new ValueChain("Green", 5)
const green1 = new ProcessStep("g1", green, 1)
const green2 = new ProcessStep("g2", green, 3)
const green3 = new ProcessStep("g3", green, 1)
green.appendProcessStep(green1)
green.appendProcessStep(green2)
green.appendProcessStep(green3)
valueChains.push(green)


//-- recruit workers and assign them to the process steps 
const woSally = new Worker("Sally", selectNextWorkItem_001)
workers.push(woSally)
const woHarry = new Worker("Harry", selectNextWorkItem_001)
workers.push(woHarry)
const woWilly = new Worker("Willy", selectNextWorkItem_001)
workers.push(woWilly)
const woJenny = new Worker("Jenny", selectNextWorkItem_001)
workers.push(woJenny)
const woBilly = new Worker("Billy", selectNextWorkItem_001)
workers.push(woBilly)

const assignmentSet = new AssignmentSet("first")
assignmentSet.addAssignment({valueChainProcessStep: { valueChain: blue, processStep: blue1}, worker: woSally})
assignmentSet.addAssignment({valueChainProcessStep: { valueChain: blue, processStep: blue2}, worker: woHarry})

assignmentSet.addAssignment({valueChainProcessStep: { valueChain: green, processStep: green1}, worker: woWilly})
assignmentSet.addAssignment({valueChainProcessStep: { valueChain: green, processStep: green2}, worker: woWilly})

assignmentSet.addAssignment({valueChainProcessStep: { valueChain: green, processStep: green2}, worker: woJenny})
assignmentSet.addAssignment({valueChainProcessStep: { valueChain: green, processStep: green3}, worker: woBilly})
assignmentSet.addAssignment({valueChainProcessStep: { valueChain: green, processStep: green2}, worker: woBilly})

//assignmentSet.addAssignment({valueChainProcessStep: { valueChain: blue, processStep: blue1}, worker: woWilly})
//assignmentSet.addAssignment({valueChainProcessStep: { valueChain: blue, processStep: blue2}, worker: woJenny})

//assignmentSet.addAssignment({valueChainProcessStep: { valueChain: green, processStep: green1}, worker: woSally})
//assignmentSet.addAssignment({valueChainProcessStep: { valueChain: green, processStep: green2}, worker: woHarry})


// create incoming workorders i.e. workitems placed in first process step


const workOrders: WorkOrder[] = [
    { orderTime: 0, valueChain: blue },
    { orderTime: 1, valueChain: blue },
    { orderTime: 2, valueChain: blue },
    { orderTime: 3, valueChain: blue },
    { orderTime: 4, valueChain: blue },
    { orderTime: 5, valueChain: blue },
    { orderTime: 6, valueChain: blue },
    { orderTime: 7, valueChain: blue },
    { orderTime: 8, valueChain: blue },
    { orderTime: 9, valueChain: blue },
    { orderTime: 10, valueChain: green },
    { orderTime: 11, valueChain: green },
    { orderTime: 12, valueChain: green },
    { orderTime: 13, valueChain: green },
    { orderTime: 14, valueChain: green },
    { orderTime: 15, valueChain: green },
    { orderTime: 16, valueChain: green },
    { orderTime: 17, valueChain: green },
    { orderTime: 18, valueChain: green },
    { orderTime: 19, valueChain: green },
    { orderTime: 20, valueChain: green }
/*
    { orderTime: 0, valueChain: blue },
    { orderTime: 0, valueChain: blue },
    { orderTime: 0, valueChain: blue },
    { orderTime: 0, valueChain: blue },
    { orderTime: 0, valueChain: blue },
    { orderTime: 0, valueChain: blue },
    { orderTime: 0, valueChain: blue },
    { orderTime: 0, valueChain: blue },
    { orderTime: 0, valueChain: blue },
    { orderTime: 0, valueChain: blue },
    { orderTime: 10, valueChain: green },
    { orderTime: 10, valueChain: green },
    { orderTime: 10, valueChain: green },
    { orderTime: 10, valueChain: green },
    { orderTime: 10, valueChain: green },
    { orderTime: 10, valueChain: green },
    { orderTime: 10, valueChain: green },
    { orderTime: 10, valueChain: green },
    { orderTime: 10, valueChain: green },
    { orderTime: 10, valueChain: green },
    { orderTime: 10, valueChain: green }
*/
]


const system = new LonelyLobsterSystem( valueChains,
                                        workers,
                                        assignmentSet, 
                                        workOrders )

system.run(50)

//console.log(outputBasket.showBasketItems())
//console.log(outputBasket.workItemBasket[5].showLog())


//outputBasket.workItemBasket.map(wi => console.log((wi.id)))
//outputBasket.workItemBasket.flatMap(wi => wi.log.map(le => console.log((le.stringify()))))

//outputBasket.workItemBasket.flatMap(wi => wi.log.filter(le => true).map(le => console.log((le.stringify()))))

// console.log(woBilly.stringifyLog())

const arr = [
    {row: 0, col1: 10, col2: 500},
    {row: 1, col1: 10, col2: 400},
    {row: 2, col1: 10, col2: 300},
    {row: 3, col1: 20, col2: 200},
    {row: 4, col1: 20, col2: 100},
]

console.log(arr[1]["col1"])

interface ArrayRow {
    row:  number,
    col1: number,
    col2: number
}


type SortColVector = string[] 
const sortColVector: SortColVector = ["col1", "col2"]

function topOfsortedMultiCols(arr: ArrayRow[], sortColVec: SortColVector): ArrayRow[] {
    if (arr.length == 0)        return arr
    if (sortColVec.length == 0) return arr

    const lastColArr = arr.pop()  // arr now one shorter 
    const lastSortCol:string = <string>sortColVec.pop() // sortColVec now one shorter

    const allSortedButLastColArr: ArrayRow[] = topOfsortedMultiCols(arr, sortColVec) // sort the left columns

    return allSortedButLastColArr.sort((a: ArrayRow, b: ArrayRow) => a["col1"] - b["col1"])
}

console.log(topOfsortedMultiCols(arr, sortColVector))

