import { Component, OnInit, Input } from '@angular/core'
import { PsInventoryColumn } from '../shared/inventory-layout'
import { UiBoxSize } from '../shared/ui-boxes-definitions'

type PsInventoryColumnShow = PsInventoryColumn & { excessWisNum: number }

@Component({
  selector: 'app-inventory-column',
  templateUrl: './inventory-column.component.html',
  styleUrls: ['./inventory-column.component.css']
})
export class InventoryColumnComponent implements OnInit {
  @Input() psInventoryColumn:       PsInventoryColumn
  @Input() isListOfEndProducts:     boolean
  @Input() inventoryColumnBoxSize:  UiBoxSize
  psInventoryColumnShow:            PsInventoryColumnShow

  constructor() { 
    //console.log("Inventory-Column: constructor()")0
  }

  ngOnInit(): void {
    this.calcHeightOfInventoryColumn()
    //console.log("Inventory-Column: ngOnInit(): psInventoryColumn.wis.length = " + this.psInventoryColumn.wis.length)
  }

  ngOnChanges(): void {
    this.calcHeightOfInventoryColumn()
  }

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
