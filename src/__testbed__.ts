//

enum Position {
    first,
    second,
    third  
}

enum SelectionCriterion {
    min,
    max
}

type PersonAsJson = {
        pos: string
        selCrit: string
    }

type Person = {
  position?: Position
  selectionCriterion?: SelectionCriterion
}

const jsonString: string  =  `{  "pos": "third", "selCrit": "min" }` 

const pj: PersonAsJson = JSON.parse(jsonString)

const p: Person = {
    position:           Object.getOwnPropertyDescriptor(Position, pj.pos)?.value,
    selectionCriterion: Object.getOwnPropertyDescriptor(SelectionCriterion, pj.selCrit)?.value
}
console.log(p)




/*
let  obj = {}
let obj2 = Object.defineProperty(obj, "name", {value: "Gerold", writable: false})
console.log(obj2)

const object1 = {};

Object.defineProperty(object1, 'property1', {
  value: 42,
  writable: false
});

console.log(object1);
// expected output: 42


console.log(Object.pro(Position).find(k => k == "second"))



const pos1: number = Position[Position.second]
console.log(pos1)
const pos2: string = Position[1]
console.log(pos2)

console.log(typeof pj.selCrit === "string")
console.log(pj.selCrit)
*/
//console.log(pj.position)
//console.log(pj.selectionCriterion)

/*
console.log(pj)
console.log(pj.pos)
console.log(typeof pj.pos === "string")
console.log(pj.selCrit)
*/



/*
const arr = ["Gerold", "Maike", "Niklas", "Betty"]

console.log(arr[EnumList.second])

const findEnumMemberByKeyAsString = (ks: string) => Object.keys(EnumList).find(k => k == ks) 

console.log(EnumList.first)
console.log(Object.keys(EnumList).filter(k => k == "second"))

console.log(EnumList["second"])

console.log(arr[EnumList["second"]])

*/