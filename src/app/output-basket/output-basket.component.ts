import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { I_OutputBasket, I_WorkItem } from '../shared/api-definitions';

@Component({
  selector: 'app-output-basket',
  templateUrl: './output-basket.component.html',
  styleUrls: ['./output-basket.component.css']
})
export class OutputBasketComponent implements OnInit, OnChanges {
  @Input() ob: I_OutputBasket
  wis: I_WorkItem[]

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.wis = this.ob.workItems.map(ep => {
      return {
        id: ep.id,
        tag: ["", ""],
        accumulatedEffort: ep.accumulatedEffortInValueChain,
        elapsedTime: ep.elapsedTimeInValueChain,
        valueChainId: "unknown", // needs to be fixed later
        value: -1                // needs to be fixed later
      }
    })

  }
}
