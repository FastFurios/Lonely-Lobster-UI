//-------------------------------------------------------------------
// COLOR MAPPER SERVICE
//-------------------------------------------------------------------
// last code cleaning: 14.12.2024

import { Injectable } from '@angular/core'

export type RgbColor      = [number, number, number]
export type CssColorList  = RgbColor[]
type ObjectId             = string
export type ColoringCategory = string
export type ColorLegendItem = {
  id:               string
  backgroundColor:  string // CSS color string
  textColor:        string // CSS color string
}

/**
 * @class Given a color list it manages the latest dispensed color index.   
 * @private 
 */
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

/**
 * @class Manages a map that maps objects to assigned colors.
 */
export class ObjectColorMap extends Map<ObjectId, RgbColor> {
  private changeAndResetChangeIndicatorState: boolean = true // true if lately   .... dubious
  constructor(private colDisp: ColorDispenser) { 
    super() 
  }
  /** 
   * @param id - id of the object which's color is looked up  
   * @returns the assigned color of the object 
   */
  public color(id: ObjectId): RgbColor {
    let color = this.get(id)
    if (!color) { // in case it has no color yet, a color is assigned
      color = this.colDisp.nextColor
      this.set(id, color)
      this.changeAndResetChangeIndicatorState = true
    }
    return color
  }
}

/**
 * @class Service to manage colors assigned to objects of various categories
 */
@Injectable({
  providedIn: 'root'
})
export class ColorMapperService extends Map<ColoringCategory, ObjectColorMap> {
  constructor() { super() }

  /** 
   * Adds a new category with its color map
   * @param cat - the category   
   * @param colList - the color list   
   */
  public addCategory(cat: ColoringCategory, colList: CssColorList): void {
    this.set(cat, new ObjectColorMap(new ColorDispenser(colList)))
  }

  /** 
   * Looks up the color of an object of a given category
   * @param cat - the category
   * @param objId - id of the object
   * @returns the color of the object or undefined if object is not found    
   */
  public colorOfObject(cat: ColoringCategory, objId: ObjectId): RgbColor | undefined {
    if (!this.get(cat)) throw new Error("ColorMapperService: colorOfObject(...): cat is undefined")
    return this.get(cat)?.color(objId)
  }

  /** 
   * Looks up the color map of a given category
   * @param cat - the category
   * @returns the color map or undefined if not found    
   */
  public allAssignedColors(cat: ColoringCategory): ObjectColorMap | undefined {
    return this.get(cat)
  }

  /** 
   * Looks up the objects and their assigned colors
   * @param cat - the category
   * @returns an array of tuples of object ids and their color    
   */
  public allAssignedColorsAsArray(cat: ColoringCategory): [ObjectId, RgbColor][]  {
    const arr: [ObjectId, RgbColor][] = []
    if (!this.allAssignedColors(cat)) throw new Error("allAssignedColorsAsArray: this.allAssignedColors(" + cat + ") is undefined")
    //for (let e of this.allAssignedColors(cat)!) arr.push(e)
    return [...(this.allAssignedColors(cat)!.entries())] // return arr
  }
}