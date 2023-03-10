import { Component, OnInit, Input } from '@angular/core';
import { PsInventoryWi } from '../shared/workitems-inventory.service'

type Color = { red: number; green: number; blue: number }

@Component({
  selector: 'app-inventory-workitem',
  templateUrl: './inventory-workitem.component.html',
  styleUrls: ['./inventory-workitem.component.css']
})
export class InventoryWorkitemComponent implements OnInit {
  @Input() wi: PsInventoryWi


  constructor() { }

  ngOnInit(): void {
  }

  get colorOfWorkitem(): string {
    const maxEffort: number      = 10
    const maxEffortRgb: Color = {
      red:    55,
      green:  0,
      blue:   0
    }
    const minEffortRgb: Color = {
      red:    255,
      green:  200,
      blue:   200
    }
    const minMaxEffortRgbSpan: Color = {
      red:    minEffortRgb.red - maxEffortRgb.red,
      green:  minEffortRgb.green - maxEffortRgb.green,
      blue:   minEffortRgb.blue - maxEffortRgb.blue
    }

    let rgb = {
      red:   minEffortRgb.red   - this.wi.accumulatedEffortInProcessStep / maxEffort * minMaxEffortRgbSpan.red,
      green: minEffortRgb.green - this.wi.accumulatedEffortInProcessStep / maxEffort * minMaxEffortRgbSpan.green,
      blue:  minEffortRgb.blue  - this.wi.accumulatedEffortInProcessStep / maxEffort * minMaxEffortRgbSpan.blue,
    }
    return `background-color: rgb(${rgb.red}, ${rgb.green}, ${rgb.blue})`
  }

  isLastWiBeforeColumnOverflow = (): boolean => this.wi.id == 3  // ** to be extended


}
