import { Component, OnInit, OnChanges, Input } from '@angular/core'
import { I_WorkItem } from '../shared/io_api_definitions'
import { PsInventory, PsInventoryShow, workitemsAsPsInventory } from '../shared/inventory-layout'

type UiBoxSize = {
  width:  number
  height: number
}

const inventoryColWidth = 15

// --- Component Class ----------------------------------------------

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  @Input() wis: I_WorkItem[]
  @Input() isListOfEndProducts: boolean
  @Input() inventoryBoxSize: UiBoxSize
  inventoryColumnBoxSize: UiBoxSize
  psInventory: PsInventory
  psInventoryShow: PsInventoryShow
  numColsShown: number
  //width: number = 100
  
  constructor() { }

  ngOnInit(): void { 
    this.psInventory = workitemsAsPsInventory(this.wis, this.isListOfEndProducts)
    this.calcSizesOfInventoryColumn()
  }

  ngOnChanges(): void {
    console.log("InventoryComponent:inventoryColumnBoxSize changed")
    this.calcSizesOfInventoryColumn()
  }

  private calcSizesOfInventoryColumn(): void {
    if (!this.psInventory) return
    this.inventoryColumnBoxSize = { 
      width:  inventoryColWidth, 
      height: this.inventoryBoxSize.height }
    this.numColsShown = Math.round((this.inventoryBoxSize.width - 20) / inventoryColWidth)
    this.psInventoryShow = {
      cols:            this.psInventory.slice(0, this.numColsShown),
      excessColsWiNum: this.psInventory.length <= this.numColsShown ? 0 : this.psInventory.slice(this.numColsShown).map(col => col.wis.length).reduce((a, b) => a + b)    // /*slice(5).*/flatMap(col => col.wis).length
    }
  }

}
