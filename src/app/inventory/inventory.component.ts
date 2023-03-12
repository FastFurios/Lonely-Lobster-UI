import { Component, OnInit } from '@angular/core'
import { PsInventory, WorkitemsInventoryService, PsInventoryColumn } from '../shared/workitems-inventory.service';

type PsInventoryShow = { 
  cols: PsInventory;
  excessColsWiNum: number
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {

  psInventory: PsInventory
  psInventoryShow: PsInventoryShow

  constructor(private wiInvSrv: WorkitemsInventoryService) { 
    this.psInventory = wiInvSrv.processStepInventory
  }

  ngOnInit(): void { 

    this.psInventoryShow = {
      cols:            this.psInventory.slice(0, 5),
      excessColsWiNum: this.psInventory.slice(5).flatMap(col => col.wis).length
    }
  }


}
