//-------------------------------------------------------------------
// INVENTORY COLUMN COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 21.12.2024

import { Component, OnInit, Input } from '@angular/core'
import { PsInventoryColumn } from '../shared/inventory-layout'
import { UiBoxSize } from '../shared/ui-boxes-definitions'

type PsInventoryColumnShow = PsInventoryColumn & { excessWisNum: number }

/**
 * @class This Angular component renders a single column in an inventory display.
 */
@Component({
  selector: 'app-inventory-column',
  templateUrl: './inventory-column.component.html',
  styleUrls: ['./inventory-column.component.css']
})
export class InventoryColumnComponent implements OnInit {
  /** the inventory column */
  @Input() psInventoryColumn:       PsInventoryColumn
  /** true if output basket inventory column */
  @Input() isListOfEndProducts:     boolean
  /** size of inventory column display area  */
  @Input() inventoryColumnBoxSize:  UiBoxSize
  /** work items in the columns  prepared for display i.e. with numbers of non-dispalyable excess work items */
  psInventoryColumnShow:            PsInventoryColumnShow

  /** @private */
  constructor() { }

  /** calculate number of displayable and excess work items */
  ngOnInit(): void {
    this.calcHeightOfInventoryColumn()
  }

  /** calculate number of displayable and excess work items */
  ngOnChanges(): void {
    this.calcHeightOfInventoryColumn()
  }

  /** calculate how many work items fit into the height of the inventory column and the number of non-displayable excess work items */
  private calcHeightOfInventoryColumn(): void {
    const wisShow = this.psInventoryColumn.wis.slice(0, Math.floor(this.inventoryColumnBoxSize.height / (1 + 15 + 1) /* = wi box with margin top and bottom */) - 1)
    const excessWisNum = this.psInventoryColumn.wis.length - wisShow.length

    this.psInventoryColumnShow = {
      colNr:        this.psInventoryColumn.colNr, 
      wis:          wisShow,
      excessWisNum: excessWisNum
    } 
  }
}
