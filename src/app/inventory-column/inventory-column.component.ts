import { Component, OnInit, Input } from '@angular/core';
import { PsInventoryColumn } from '../shared/inventory-layout'

type PsInventoryColumnShow = PsInventoryColumn & { excessWisNum: number }

type UiBoxSize = {
  width:  number
  height: number
}

@Component({
  selector: 'app-inventory-column',
  templateUrl: './inventory-column.component.html',
  styleUrls: ['./inventory-column.component.css']
})
export class InventoryColumnComponent implements OnInit {
  @Input() psInventoryColumn:       PsInventoryColumn
  @Input() isListOfEndProducts:     boolean
  @Input() inventoryColumnBoxSize:  UiBoxSize
  psInventoryColumnShow: PsInventoryColumnShow

  constructor() { }

  ngOnInit(): void {
    //console.log("InventoryColumnComponent: this.ngOnInit()")
    this.calcHeightOfInventoryColumn()
//  console.log("InventoryColumnComponent:ngOnChanges() psInventoryColumnShow.wis.length=" + this.psInventoryColumnShow.wis.length)
//  console.log("InventoryColumnComponent:ngOnChanges() inventoryColumnBoxSize.height=" + this.inventoryColumnBoxSize.height)

  }

  ngOnChanges(): void {
//  console.log("InventoryColumnComponent:inventoryColumnBoxSize changed")
    this.calcHeightOfInventoryColumn()
  }

  private calcHeightOfInventoryColumn(): void {
    const wisShow = this.psInventoryColumn.wis.slice(0, Math.floor(this.inventoryColumnBoxSize.height / 15))
    const excessWisNum = this.psInventoryColumn.wis.length - wisShow.length

    this.psInventoryColumnShow = {
      colNr:        this.psInventoryColumn.colNr, 
      wis:          wisShow,
      excessWisNum: excessWisNum
    } 
  }
}
