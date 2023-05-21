import { Component, OnInit, HostListener } from '@angular/core';
//import { Options } from '@angular-slider/ngx-slider';
import { WorkitemsInventoryService } from '../shared/workitems-inventory.service'
import { I_SystemState } from '../shared/io_api_definitions'
import { Observable } from "rxjs"


type UiCellSize = {
  width:  number
  heigth: number
}


@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.css']
})
export class SystemComponent implements OnInit {
  systemState$: Observable<I_SystemState>  
  innerCellSize: UiCellSize 

  constructor( private wiInvSrv: WorkitemsInventoryService ) { 
    this.systemState$ = this.wiInvSrv.nextSystemStateOnInput
    this.innerCellSize = { width: 0, heigth: 0 }
  }

  ngOnInit(): void {
//  this.systemState$.subscribe(sysState => console.log("SystemComponent.onInit: number of valuechains = " + sysState.valueChains.length ))
    this.innerCellSize.width = window.innerWidth
    this.innerCellSize.heigth = window.innerHeight
  }
 
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.innerCellSize.width = window.innerWidth
    this.innerCellSize.heigth = window.innerHeight
  }

  nextIterationState(): void {
    console.log(this.systemState$)
    this.systemState$ = this.wiInvSrv.nextSystemStateOnInput
  }

}
