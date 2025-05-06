//-------------------------------------------------------------------
// INVENTIÒRY COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 21.12.2024

import { Component, OnInit, Input, OnChanges } from '@angular/core'
import { I_WorkItem } from '../shared/io_api_definitions'
import { PsInventory, PsInventoryShow, workitemsAsPsInventory } from '../shared/inventory-layout'
import { UiBoxSize, UiInventoryColWidth } from '../shared/ui-boxes-definitions'

/**
 * @class This Angular component renders the work item inventory of a work item basket i.e. a process step or the output basket.  
 */
@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit, OnChanges {
  /** work items in the inventory */
  @Input() wis:                 I_WorkItem[]
  /** true if inventory of output basket */
  @Input() isListOfEndProducts: boolean
  /** size of inventory display area */
  @Input() inventoryBoxSize:    UiBoxSize
  /** work items grouped in columns by elapsed time */
  psInventory:                  PsInventory
  /** work items grouped in columns by elapsed time prepared for display i.e. with numbers of non-dispalyable excess work items */
  psInventoryShow:              PsInventoryShow
  /** number of displayed columns */
  numColsShown:                 number
  
  /** @private */
  constructor() { }
  /** @private */
  ngOnInit(): void { }

  /** adapt inventory display when work items in inventory change or display area size is changed */
  ngOnChanges(): void {
    this.psInventory = workitemsAsPsInventory(this.wis, this.isListOfEndProducts)
    this.calcSizesOfInventoryColumn()
  }

  // ----- (re-)sizing of childs' UI boxes  -------------
  /** UI box size of a column */
  inventoryColumnBoxSize: UiBoxSize

  /** adapt the inventory display to the available display area */
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
