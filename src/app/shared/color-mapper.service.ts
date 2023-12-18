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

export class ObjectColorMap extends Map<ColoringCategory, RgbColor> {
  constructor(private colDisp: ColorDispenser) { 
    super() 
  }

  private changeAndResetChangeIndicatorState: boolean = true

  public changed(): boolean {
    let aux = this.changeAndResetChangeIndicatorState
    this.changeAndResetChangeIndicatorState = false
    return aux
  }

  public color(id: ObjectId): RgbColor {
    let color = this.get(id)
    if (!color) {
      color = this.colDisp.nextColor
      this.set(id, color)
      this.changeAndResetChangeIndicatorState = true
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

  public allAssignedColors(cat: ColoringCategory): ObjectColorMap | undefined {
    return this.get(cat)
  }

  public allAssignedColorsAsArray(cat: ColoringCategory): [string, RgbColor][]  {
    const arr: [string, RgbColor][] = []
    if (!this.allAssignedColors(cat)) throw new Error("allAssignedColorsAsArray: this.allAssignedColors(" + cat + ") is undefined")
    for (let e of this.allAssignedColors(cat)!) arr.push(e)
    return arr
  }

  public changed(cat: ColoringCategory): boolean {
    if (this.get(cat)) return this.get(cat)!.changed()
    return false
  }
}