import { Injectable } from '@angular/core'

export type RgbColor      = [number, number, number]
export type CssColorList  = RgbColor[]
export type ObjectType    = string
export type ObjectId      = string
export type ObjectIdToCssColorMap = Map<[ObjectType, ObjectId], RgbColor>  

class ObjectTypeAndIdToCssColorMap<KObj, KId, V> extends Map<[KObj, KId], V> {
    constructor(initialEntries?: [[KObj, KId], V][]) {
        super(initialEntries)
    }
    public getKeyWithContent(c: [KObj, KId]): V | undefined {
        for (let e of super.entries()) {
            if (e[0][0] == c[0] && e[0][1] == c[1]) return e[1]
        }
        return undefined
    }
}

const cssColorList: CssColorList = [ 
  [255, 200, 200],  // faint red
  [200, 255, 200],  // faint green 
  [200, 200, 255],  // faint blue
  [215, 145, 215],  // faint purple
  [215, 195, 215]   // faint gold
]

@Injectable({
  providedIn: 'root'
})
export class ColorMapperService {
  private objTypeAndIdToCssColorMap = new ObjectTypeAndIdToCssColorMap<ObjectType, ObjectId, RgbColor>() 
  private colDispIter = this.colorDispenser()
  
  constructor() { }
  
  private *colorDispenser(): IterableIterator<RgbColor> {
    for(let numColors = Object.keys(cssColorList).length, i = 0; true; i++) {
      yield cssColorList[i % numColors]
    } 
  }

  public colorOfObject(key: [ObjectType, ObjectId]): RgbColor {
    const e = this.objTypeAndIdToCssColorMap.getKeyWithContent(key)
    if (e != undefined) return e

    const nextColor = this.colDispIter.next().value
    this.objTypeAndIdToCssColorMap.set(key, nextColor)
    return nextColor
  } 

}
