//

function optArg2(a: number, b?: number) {
    if (b == undefined) return a
    return a + b
}

console.log(optArg2(1, 2))
console.log(optArg2(1))
console.log(optArg2(1, undefined))
