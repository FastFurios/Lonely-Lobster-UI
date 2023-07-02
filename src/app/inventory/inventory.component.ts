import { Component, OnInit, OnChanges, Input } from '@angular/core'
import { I_WorkItem } from '../shared/io_api_definitions'
import { PsInventory, PsInventoryShow, workitemsAsPsInventory } from '../shared/inventory-layout'
import { UiBoxSize, UiInventoryColWidth, UiInventoryBoxHeightShrink} from '../shared/ui-boxes-definitions';


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
  psInventory: PsInventory
  psInventoryShow: PsInventoryShow
  numColsShown: number
  //width: number = 100
  
  constructor() { }

  ngOnInit(): void { 
//    console.log("InventoryComponent.ngOnInit() this.inventoryBoxSize=")
//    console.log(this.inventoryBoxSize)
  }

  ngOnChanges(): void {
    this.psInventory = workitemsAsPsInventory(this.wis, this.isListOfEndProducts)
    this.calcSizesOfInventoryColumn()
  }

  // ----- (re-)sizing of childs' UI boxes  -------------

  inventoryColumnBoxSize: UiBoxSize

  private calcSizesOfInventoryColumn(): void {
    if (!this.psInventory) return
//    this.inventoryBoxSize.height *= UiInventoryBoxHeightShrink
    this.inventoryColumnBoxSize = { 
      width:  UiInventoryColWidth, 
      height: this.inventoryBoxSize.height }
    this.numColsShown = Math.round((this.inventoryBoxSize.width - 20) / UiInventoryColWidth)
    this.psInventoryShow = {
      cols:            this.psInventory.slice(0, this.numColsShown),
      excessColsWiNum: this.psInventory.length <= this.numColsShown ? 0 : this.psInventory.slice(this.numColsShown).map(col => col.wis.length).reduce((a, b) => a + b)    // /*slice(5).*/flatMap(col => col.wis).length
    }
    //console.log("InventoryComponent.calcSizesOfInventoryColumn(): psInventoryShow=")
    //console.log(this.psInventoryShow)
    //console.log("InventoryComponent.calcSizesOfInventoryColumn(): inventoryBoxSize=")
    //console.log(this.inventoryBoxSize)
  }
}
