//

let arr = ["a", "b", "c", "d", "e"] // [1, 2, 3, 4, 5]



interface SplitArray<T> {
    head:   T[] 
    middle: T
    tail:   T[]
}
function reshuffle<T>(a: T[]): T[] {
    if (a.length == 0) return []
    const splitIndex = Math.floor(Math.random() * a.length)
    const sa: SplitArray<T> = split(a, splitIndex)
    return [a[splitIndex]].concat(reshuffle<T>(sa.head.concat(sa.tail)))
}


//let sa: SplitArray = { head: [1, 2], middle: 3, tail: [4, 5]}

function split<T>(a: T[], splitIndex: number): SplitArray<T>  {
   return { head: a.slice(undefined, splitIndex),
            middle: a[splitIndex],
            tail: a.slice(splitIndex + 1, undefined)
          }
}
/*
let stats: number[] = [0, 0, 0, 0, 0, 0]
for(let i=0, j=0; i<1000; i++) {
    j = reshuffle(arr)[0]
    stats[j]++
}
console.log(stats)
*/

console.log(arr.slice(0))
console.log(arr.slice(1))
console.log(arr.slice(2))
console.log(arr.slice(3))
console.log(arr.slice(4))

console.log(split(arr, 0))

console.log(reshuffle(arr))
console.log(reshuffle(arr))
console.log(reshuffle(arr))
console.log(reshuffle(arr))
console.log(reshuffle(arr))
console.log(reshuffle(arr))
console.log(reshuffle(arr))
console.log(reshuffle(arr))
console.log(reshuffle(arr))
console.log(reshuffle(arr))
console.log(reshuffle(arr))
console.log(reshuffle(arr))
console.log(reshuffle(arr))
console.log(reshuffle(arr))
console.log(reshuffle(arr))
console.log(reshuffle(arr))
console.log(reshuffle(arr))
console.log(reshuffle(arr))
console.log(reshuffle(arr))

