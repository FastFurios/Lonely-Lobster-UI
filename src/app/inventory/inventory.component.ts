import { Component, OnInit, Input } from '@angular/core'
import { I_WorkItem } from '../shared/io_api_definitions'
import { PsInventory, PsInventoryShow, workitemsAsPsInventory } from '../shared/inventory-layout'
import { UiBoxSize, UiInventoryColWidth } from '../shared/ui-boxes-definitions'

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  @Input() wis:                 I_WorkItem[]
  @Input() isListOfEndProducts: boolean
  @Input() inventoryBoxSize:    UiBoxSize
  psInventory:                  PsInventory
  psInventoryShow:              PsInventoryShow
  numColsShown:                 number
  
  constructor() { }

  ngOnInit(): void { }

  ngOnChanges(): void {
    this.psInventory = workitemsAsPsInventory(this.wis, this.isListOfEndProducts)
    this.calcSizesOfInventoryColumn()
  }

  // ----- (re-)sizing of childs' UI boxes  -------------
  inventoryColumnBoxSize: UiBoxSize

  private calcSizesOfInventoryColumn(): void {
    if (!this.psInventory) return

    this.inventoryColumnBoxSize = { 
      width:  UiInventoryColWidth, 
      height: this.inventoryBoxSize.height }
    this.numColsShown = Math.round((this.inventoryBoxSize.width - (1 + 15 + 1) /* = wi box with margin left and right */) / UiInventoryColWidth)
    this.psInventoryShow = {
      cols:            this.psInventory.slice(1, this.numColsShown),
      excessColsWiNum: this.psInventory.length <= this.numColsShown ? 0 : this.psInventory.slice(this.numColsShown).map(col => col.wis.length).reduce((a, b) => a + b)
    }
  }
}
