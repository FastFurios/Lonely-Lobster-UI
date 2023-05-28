import { Component, OnInit, HostListener } from '@angular/core';
//import { Options } from '@angular-slider/ngx-slider';
import { WorkitemsInventoryService } from '../shared/workitems-inventory.service'
import { I_SystemState } from '../shared/io_api_definitions'
import { Observable } from "rxjs"


type UiBoxSize = {
  width:  number
  height: number
}
const UiSystemHeaderHeight = 300  // px
const UiWorkerStatsHeight  = 600  // px


@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.css']
})
export class SystemComponent implements OnInit {
  systemState$: Observable<I_SystemState>  
  numValueChains: number
  vcsBoxSize: UiBoxSize = { width: 0, height: 0 }   // all Value Chains
  vcBoxSize:  UiBoxSize = { width: 0, height: 0 }   // a single Value Chain
  obBoxSize:  UiBoxSize = { width: 0, height: 0 }   // Output Basket
  

  constructor( private wiInvSrv: WorkitemsInventoryService ) { 
    this.systemState$ = this.wiInvSrv.nextSystemStateOnInput
    this.systemState$.subscribe(syst => { this.numValueChains = syst.valueChains.length; this.calcSizeOfUiBoxes() })
  }

  ngOnInit(): void {
//    this.calcSizeOfUiBoxes()
  }
 
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.calcSizeOfUiBoxes()
  }

  private calcSizeOfUiBoxes(): void {
    this.vcsBoxSize = { 
      width:  Math.round( window.innerWidth / 2), 
      height: Math.round(window.innerHeight - UiSystemHeaderHeight - UiWorkerStatsHeight)
    }
    this.vcBoxSize = { 
      width:  this.vcsBoxSize.width, 
      height: this.vcsBoxSize.height / this.numValueChains
    }
    this.obBoxSize = { 
      width:  Math.round( window.innerWidth  - this.vcBoxSize.width), 
      //heigth: Math.round((window.innerHeight - UiSystemHeaderHeight - UiWorkerStatsHeight))
      height: this.vcsBoxSize.height
    }
  }

  public nextIterationState(): void {
    console.log(this.systemState$)
    this.systemState$ = this.wiInvSrv.nextSystemStateOnInput
  }

}
