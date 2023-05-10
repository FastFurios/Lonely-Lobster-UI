import { Component, OnInit, Input } from '@angular/core';
import { Options } from '@angular-slider/ngx-slider';
import { I_ValueChain } from '../shared/api-definitions'

@Component({
  selector: 'app-value-chain',
  templateUrl: './value-chain.component.html',
  styleUrls: ['./value-chain.component.css']
})
export class ValueChainComponent implements OnInit {
  @Input() vc: I_ValueChain  //2  systemState$: Observable<I_SystemState>  
//1  systemState: I_SystemState

  constructor( /*2 private wiInvSrv: WorkitemsInventoryService */ ) { }

  ngOnInit(): void {
//  this.systemState$ = this.wiInvSrv.nextSystemState
//2    this.systemState$ = this.wiInvSrv.nextSystemStateOnInput
//1    this.systemState$.subscribe(sysState => this.systemState = sysState)
  }

//2  nextIterationState(): void {
//2    console.log(this.systemState$)
//2//  this.systemState$ = this.wiInvSrv.nextSystemState
//2    this.systemState$ = this.wiInvSrv.nextSystemStateOnInput
//1    this.systemState$.subscribe(sysState => this.systemState = sysState)
//2  }

  
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
