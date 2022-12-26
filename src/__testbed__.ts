const barLength = 20

function stringifyBar2(bsk: string[]): string {
    const lenAsString = bsk.length.toString()

    return "|" + (bsk.map(wi => wi)
                     .reduce((a, b) => a + b)
                     .padEnd(barLength - lenAsString.length))
                 .substring(0, barLength - lenAsString.length) 
               +  lenAsString + "|"

}
function stringifyBar(bsk: string[]): string {
    const lenAsString = bsk.length.toString()

    return "|" + (bsk.map(wi => wi)
                     .reduce((a, b) => a + b)
                     .padEnd(barLength - lenAsString.length))
                 .substring(0, barLength - lenAsString.length) 
               +  lenAsString + "|"

}

console.log("|--------------------|")

let basket = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]


basket = ["a", "b", "c", "d"]
console.log(stringifyBar(basket))

basket = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
console.log(stringifyBar(basket))

basket = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
console.log(stringifyBar(basket))

basket = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", 
"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
console.log(stringifyBar(basket))



