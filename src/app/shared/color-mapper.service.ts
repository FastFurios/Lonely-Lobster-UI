import { Injectable } from '@angular/core'

export type RgbColor      = [number, number, number]
export type CssColorList  = RgbColor[]
export type ObjectType    = string
export type ObjectId      = string
export type ObjectIdToCssColorMap = Map<[ObjectType, ObjectId], RgbColor>  
export type ColoringCategory = string

class ColorDispenser {
  private nextIndex: number = 0
  constructor(private colList: CssColorList) {
    if (!(colList.length > 0)) throw new Error("ColorMapperService: ColorListStatus: Cannot handle empty color list!")
  }
  get nextColor(): RgbColor {
    let nc = this.colList[this.nextIndex]
    this.nextIndex = (this.nextIndex + 1) % this.colList.length
    return nc
  }
}

class ObjectColorMap extends Map<ColoringCategory, RgbColor> {
  constructor(private colDisp: ColorDispenser) { super() }

  public color(id: ObjectId): RgbColor {
    let color = this.get(id)
    if (!color) {
      color = this.colDisp.nextColor
      this.set(id, color)
    }
    return color
  }
}

@Injectable({
  providedIn: 'root'
})
export class ColorMapperService extends Map<ColoringCategory, ObjectColorMap> {
  constructor() { super() }

  public addCategory(cat: ColoringCategory, colList: CssColorList): void {
    this.set(cat, new ObjectColorMap(new ColorDispenser(colList)))
  }

  public colorOfObject(cat: ColoringCategory, obj: ObjectId): RgbColor | undefined {
    if (!this.get(cat)) throw new Error("ColorMapperService: colorOfObject(...): cat is undefined")
    console.log("ColorMapperService: colorOfObject(...): this.get(cat)?.color(obj) = " + this.get(cat)?.color(obj))
    return this.get(cat)?.color(obj)
  }

  public showAllAssignedColors(): void {
    for(let e of this) {
      e.forEach((cat, _, ocm) => console.log(cat + ", ocm=" + ocm.forEach((id, col) => id + ": " + col)))
    }
  }
}

/*
class ColorListManager {
  private nextIndex: number = 0
  constructor(private colList: CssColorList) {
    if (!(colList.length > 0)) throw new Error("ColorMapperService: ColorListStatus: Cannot handle empty color list!")
  }
  get nextColor(): RgbColor {
    //console.log("ColorListManager.nextcolor(): nextIndex before= " + this.nextIndex)
    let nc = this.colList[this.nextIndex]
    //console.log("ColorListManager.nextcolor(): nc = " + nc)
    this.nextIndex = (this.nextIndex + 1) % this.colList.length
    //console.log("ColorListManager.nextcolor(): nextIndex after = " + this.nextIndex)
    return nc
  }
}

class ObjectColorMap extends Map<ColoringCategory, RgbColor> {
  constructor(private clm: ColorListManager) { super() }

  public color(id: ObjectId): RgbColor {
    //console.log("ObjectColorMap.color(" + id + ")")
    let color = this.get(id)
    //console.log("ObjectColorMap.color = " + color)
    if (!color) {
      color = this.clm.nextColor
      //console.log("ObjectColorMap.color = this.clm.nextColor = " + color)
      this.set(id, color)
    }
    //console.log("ObjectColorMap: returning color = " + color)
    return color
  }
}

export class ColorMapperService extends Map<ColoringCategory, ObjectColorMap> {
  constructor() { super() }

  public addCategory(cat: ColoringCategory, colList: CssColorList): void {
    this.set(cat, new ObjectColorMap(new ColorListManager(colList)))
  }

  public colorOfObject(cat: ColoringCategory, obj: ObjectId): RgbColor | undefined {
    //console.log("ColorMapperService: colorOfObject(" + cat + ", " + obj + ")")
    //console.log("ColorMapperService: this.colorDispenserMap.get(" + cat + ")" + this.colorDispenserMap.get(cat)?.color("one"))
    return this.get(cat)?.color(obj)
  }

}
=================================================

class ObjectTypeAndIdToValueMap<KObj, KId, V> extends Map<[KObj, KId], V> {
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
  private objTypeAndIdToCssColorMap = new ObjectTypeAndIdToValueMap<ObjectType, ObjectId, RgbColor>() 
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
*/