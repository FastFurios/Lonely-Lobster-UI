import { Component, OnInit } from '@angular/core';
import { Options } from '@angular-slider/ngx-slider';

@Component({
  selector: 'app-value-chain',
  templateUrl: './value-chain.component.html',
  styleUrls: ['./value-chain.component.css']
})
export class ValueChainComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  value: number = 1;
  options: Options = {
    floor: 0,
    ceil: 5,
    vertical: true,
    showTicks: true,
    tickStep: 1
  };

  doubleValue: number
  onSliderChange(): void {
    this.doubleValue = this.value * 2
  }
}
