import { Component, OnInit } from '@angular/core';
//import { Options } from '@angular-slider/ngx-slider';
import { WorkitemsInventoryService } from '../shared/workitems-inventory.service'
import { I_SystemState } from '../shared/api-definitions'
import { Observable } from "rxjs"

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.css']
})
export class SystemComponent implements OnInit {
  systemState$: Observable<I_SystemState>  

  constructor( private wiInvSrv: WorkitemsInventoryService ) { }

  ngOnInit(): void {
    this.systemState$ = this.wiInvSrv.nextSystemStateOnInput
  }

  nextIterationState(): void {
    console.log(this.systemState$)
    this.systemState$ = this.wiInvSrv.nextSystemStateOnInput
  }

}
