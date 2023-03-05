import { Component, OnInit } from '@angular/core'
import { PsInventory, WorkitemsInventoryService } from '../shared/workitems-inventory.service'

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {

  psInventory: PsInventory

  constructor(private wiInvSrv: WorkitemsInventoryService) { 
    this.psInventory = wiInvSrv.processStepInventory
  }

  ngOnInit(): void { }


}
