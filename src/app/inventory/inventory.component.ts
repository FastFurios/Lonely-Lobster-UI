import { Component, OnInit } from '@angular/core'
import { PsInventory, WorkitemsInventoryService, PsInventoryColumn } from '../shared/workitems-inventory.service';

type PsInventoryShow = { 
  cols: PsInventory;
  overload: boolean 
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
      cols:     this.psInventory.slice(0, 5),
      overload: this.psInventory.length > 5
    }
  }


}
