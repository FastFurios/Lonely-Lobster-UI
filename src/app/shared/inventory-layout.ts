//-------------------------------------------------------------------
// INVENTORY LAYOUT HELPLERS
//-------------------------------------------------------------------
// last code cleaning: 15.12.2024

/**
 * Helper types and functions to build a proper process step nventory from a list of workitems and their statistics
 */
import { ValueChainId, Effort, Value, RgbColor, I_WorkItem } from "./io_api_definitions"
import { CssColorList } from "./color-mapper.service"

/**
 * List of colors being assigned to workitems by value chain  
 */
export const cssColorListVc: CssColorList = [
  [255, 200, 200],  // faint red
  [200, 255, 200],  // faint green 
  [200, 200, 255],  // faint blue
  [215, 145, 215],  // faint purple
  [215, 195, 215]   // faint gold
]

/**
 * List of colors being assigned to workitem selection strategies  
 */
export const cssColorListSest: CssColorList = [
  [255,   0,   0],  // red
  [  0, 255,   0],  // green 
  [  0,   0, 255],  // blue
  [128,   0, 128],  // purple
  [255, 165,   0],  // orange
  [255, 255,   0]   // yellow
]

/**
 * Decides the text color dependent on the background color intensity 
 * @param bgColor - Backgrond color
 * @returns The text color: black if background color is not too dark, white if so
 */
export function textColorAgainstBackground(bgColor: RgbColor): RgbColor {
  return bgColor[0] + bgColor[1] * 1.2 + bgColor[2] < 300 ? [255, 255, 255] : [0, 0, 0]   
} 

/**
 * Creates a CSS color code  
 * @param rgbColor - color
 * @returns Color string usable in CSS style directives 
 */
export function rgbColorToCssString(rgbColor: RgbColor): string {
  return `rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]})`
}

/**
 * Data strcuture that contains all attributes relevant for displaying a workitem  
 */
export type PsInventoryWi = {
    id:                number,
    valueChainId:      ValueChainId,
    isEndProduct:      boolean,
    rgbColor:          RgbColor,
    valueOfValueChain: Value,   
    maxEffort:         Effort, 
    accumulatedEffort: number,
    elapsedTime:       number,
}
  
/**
 * Data structure that contains the workitems of the same age in the current workitem basket i.e. being in the same column when displayed  
 */
export type PsInventoryColumn = {
  colNr:  number,
  wis:    PsInventoryWi[]      
}

/**
 * Array of inventory columns
 */
export type PsInventory = PsInventoryColumn[]     

/**
 * Process step inventory with #workitems too old i.e. too far right in the process step display 
 */
export type PsInventoryShow = { 
  cols: PsInventory;
  excessColsWiNum: number
}

/**
 * Creates a process inventory from a list of workitems. THe inventory is at least 5 columns wide.
 * @param wiList - List of workitems e.g. from a process step or the output basket 
 * @param isListOfEndProducts - if true it indicates the workitems are from the output basket
 * @returns a process step inventory 
 */
export function workitemsAsPsInventory(wiList: I_WorkItem[], isListOfEndProducts: boolean): PsInventory {
  const max = <T>(a:T, b:T): T => a > b ? a : b
  const maxEt = (wis: I_WorkItem[]): number => wis.length == 0 ? 0 : wis.reduce((wi1, wi2) => wi1.elapsedTime > wi2.elapsedTime ? wi1 : wi2).elapsedTime // maximum elapsed time in the workitems list wis

  let psInventory: PsInventory = [] 
  for (let col = 0; col <= max<number>(maxEt(wiList), 5); col++) {
      psInventory.push(
          { colNr: col, 
            wis: wiList.filter(wi => wi.elapsedTime == col)
                        .sort((wi1, wi2) => wi2.accumulatedEffort - wi1.accumulatedEffort)
                        .map(wi => { return {
                          id:                 wi.id,
                          valueChainId:       wi.valueChainId,
                          isEndProduct:       isListOfEndProducts,
                          rgbColor:           wi.rgbColor!,
                          valueOfValueChain:  wi.value,
                          maxEffort:          wi.maxEffort,
                          accumulatedEffort:  wi.accumulatedEffort,
                          elapsedTime:        wi.elapsedTime
                        }})
          }
      )
  }
  return psInventory
}

