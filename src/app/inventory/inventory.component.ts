import { Component, OnInit, Input } from '@angular/core'
import { I_WorkItem } from '../shared/io_api_definitions'
import { PsInventory, PsInventoryShow, workitemsAsPsInventory } from '../shared/inventory-layout'

// --- Component Class ----------------------------------------------

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  @Input() wis: I_WorkItem[]
  @Input() isListOfEndProducts: boolean
  psInventory: PsInventory
  psInventoryShow: PsInventoryShow
  
  constructor() {}
/*
  constructor(private wiInvSrv:     WorkitemsInventoryService) {
    this.psInventory = wiInvSrv.processStepInventory
  }
*/

  ngOnInit(): void { 
    this.psInventory = workitemsAsPsInventory(this.wis, this.isListOfEndProducts)
//    console.log("InventoryComponent/ngOnInit()/this.psInventory.length=" + this.psInventory.length)
    const numCols = 5
    this.psInventoryShow = {
      cols:            this.psInventory.slice(0, numCols),
      excessColsWiNum: this.psInventory.length <= numCols ? 0 : this.psInventory.slice(numCols).map(col => col.wis.length).reduce((a, b) => a + b)    // /*slice(5).*/flatMap(col => col.wis).length
    }
//    console.log("InventoryComponent/ngOnInit/psInventory = ... ")
//    console.log(this.psInventory)
  }

}
