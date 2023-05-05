import { Component, OnInit } from '@angular/core';
import { Options } from '@angular-slider/ngx-slider';
import { I_SystemState } from '../shared/api-definitions'
import { WorkitemsInventoryService } from '../shared/workitems-inventory.service'

import { Observable } from "rxjs"

@Component({
  selector: 'app-value-chain',
  templateUrl: './value-chain.component.html',
  styleUrls: ['./value-chain.component.css']
})
export class ValueChainComponent implements OnInit {
  systemState$: Observable<I_SystemState>  
//1  systemState: I_SystemState

  constructor( private wiInvSrv: WorkitemsInventoryService ) { }

  ngOnInit(): void {
//  this.systemState$ = this.wiInvSrv.nextSystemState
    this.systemState$ = this.wiInvSrv.nextSystemStateOnInput
//1    this.systemState$.subscribe(sysState => this.systemState = sysState)
  }

  nextIterationState(): void {
    console.log(this.systemState$)
//  this.systemState$ = this.wiInvSrv.nextSystemState
    this.systemState$ = this.wiInvSrv.nextSystemStateOnInput
//1    this.systemState$.subscribe(sysState => this.systemState = sysState)
  }

  
  // https://angular-slider.github.io/ngx-slider/demos
  value: number = 1;
  options: Options = {
    floor: 0.1,
    ceil: 100,
    step: 0.1,
    logScale: true,
    showTicks: true,
    vertical: true,
//  tickStep: 10
  };

  doubleValue: number
  onSliderChange(): void {
    this.doubleValue = this.value * 2
  }
}
