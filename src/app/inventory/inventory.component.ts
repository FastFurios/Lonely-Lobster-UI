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
  width: number = 100
  
  constructor() {}

  ngOnInit(): void { 
    this.psInventory = workitemsAsPsInventory(this.wis, this.isListOfEndProducts)
    const numCols = this.isListOfEndProducts ? 30 : 5
    this.psInventoryShow = {
      cols:            this.psInventory.slice(0, numCols),
      excessColsWiNum: this.psInventory.length <= numCols ? 0 : this.psInventory.slice(numCols).map(col => col.wis.length).reduce((a, b) => a + b)    // /*slice(5).*/flatMap(col => col.wis).length
    }
  }

}
