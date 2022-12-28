// ########################################################################################################
//                                  LONELY LOBSTER
// a simulation of colaboration of workers in a company with multiple value chains
//      depending upon individual worker's strategies what to work on next 
//                          Gerold Lindorfer, Dec 2020 ff.
// ########################################################################################################

import { Clock } from './clock.js'
import { OutputBasket } from './workitembasketholder.js'
import { systemCreatedFromConfigFile, processWorkOrderFile } from './helpers.js'

export const clock = new Clock()

export const outputBasket = new OutputBasket()

enum InputArgs {
    "SystemConfig"      = 2,
    "WorkOrders"        = 3
}

console.log("argv[2]=" + process.argv[2] + ", " + "argv[3]=" + process.argv[3] +"\n")

export const lonelyLobsterSystem = systemCreatedFromConfigFile(process.argv[InputArgs.SystemConfig])

processWorkOrderFile(process.argv[InputArgs.WorkOrders], lonelyLobsterSystem)

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

//setTimeout(() => fr.show(), 3000)


//system.addWorkOrdersOverTime(workOrders)                                        
//system.run(50)

//console.log(outputBasket.showBasketItems())
//console.log(outputBasket.workItemBasket[5].showLog())


//outputBasket.workItemBasket.map(wi => console.log((wi.id)))
//outputBasket.workItemBasket.flatMap(wi => wi.log.map(le => console.log((le.stringify()))))

//outputBasket.workItemBasket.flatMap(wi => wi.log.filter(le => true).map(le => console.log((le.stringify()))))

// console.log(woBilly.stringifyLog())

/*

const arrObj = [
    {row: 0, col1: 10, col2: 500},
    {row: 1, col1: 10, col2: 400},
    {row: 2, col1: 10, col2: 300},
    {row: 3, col1: 20, col2: 200},
    {row: 4, col1: 20, col2: 100},
]
interface ArrayRow {
    row:  number,
    col1: number,
    col2: number
}

const arr = [
    [0, 15, 400],
    [1, 15, 200],
    [2, 10, 300],
    [3, 10, 300],
    [4, 20, 300],
    [5, 20, 200],
    [6, 30, 500]
]


function topRowsOf(arr: number[][], colsSortVector: number[]): number[][] {
    if (arr.length            == 0) return arr
    if (colsSortVector.length == 0) return arr

    const sortCol:                  number      = colsSortVector[0]
    const topValInFirstSortVecCol:  number      = Math.min(...arr.map(r => r[sortCol]))
    const topRowsByFirstSortVecCol: number[][]  = arr.filter(r => r[sortCol] == topValInFirstSortVecCol)

    return topRowsOf(topRowsByFirstSortVecCol, colsSortVector.slice(1))
}

const colsSortVector: number[]  = [1, 2]

console.log(topRowsOf(arr, colsSortVector))
*/

/*
console.log(">>>> now I try eachline: ")
let allLines: string = ">>> all lines >>> "

eachLine("srcs/workorder_001.csv", (line, last) => last ? console.log("<eof>") : allLines = allLines + line).
console.log(">>>> here are all lines: " + allLines + " <<<")
*/






/*
function* testGen(): Generator<ValueInColumn[], any, ValueInColumn[]> { // https://dev.to/gsarciotto/generators-in-typescript-4b37
    let headers:        string[] = []
    let valuesReturn:   ValueInColumn[] = []
    console.log("testGen: setup")

    while (true) {
        const line: string[] = yield valuesReturn
        console.log("testGen: read line: ")
        console.log(line)
        if (line[0] = "//") { } // just ignore 
        else if (line[0] = "##") headers = line.map(s => "[" + s + "]") 
        else { 
            for (let i = 0; i < 3; i++) valuesReturn.push({ header: headers[i], value:  parseInt(line[i]) })
            yield valuesReturn
        }
    }
    return
}

console.log("tg = testGen()")
const tg = testGen()
tg.next()

console.log("generator: comment:  ")
console.log(tg.next(["//", "Dies und das"]))

console.log("generator: header:   ")
console.log(tg.next(["##", "blue", "green", "yellow"]))

console.log("generator: values:   ")
console.log(tg.next(["0", "1", "2", "3"]))
*/




