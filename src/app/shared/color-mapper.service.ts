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
    return this.get(cat)?.color(obj)
  }

  public showAllAssignedColors(): void {
    for(let e of this) {
      e.forEach((cat, _, ocm) => console.log(cat + ", ocm=" + ocm.forEach((id, col) => id + ": " + col)))
    }
  }
}