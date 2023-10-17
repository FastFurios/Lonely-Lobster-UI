// helper functions to build a proper PsInventory from a list of workitems and their stats  
import { ValueChainId, Effort, Value, RgbColor, I_WorkItem } from "./io_api_definitions"

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
  
  export type PsInventoryColumn = {
    colNr:  number,
    wis:    PsInventoryWi[]      
  }
  
  export type PsInventory = PsInventoryColumn[]     
  
  export type PsInventoryShow = { 
    cols: PsInventory;
    excessColsWiNum: number
  }

  export function workitemsAsPsInventory(wiList: I_WorkItem[], isListOfEndProducts: boolean): PsInventory {
    const max = <T>(a:T, b:T): T => a > b ? a : b
    const maxEt = (wis: I_WorkItem[]): number => 
            wis.length == 0 ? 0 
                            : wis.reduce((wi1, wi2) => wi1.elapsedTime > wi2.elapsedTime ? wi1 : wi2).elapsedTime 
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

