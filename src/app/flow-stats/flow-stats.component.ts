import { Component, Input, OnInit } from '@angular/core';
import { I_FlowStats } from '../shared/flow-stats-definitions';


@Component({
  selector: 'app-flow-stats',
  templateUrl: './flow-stats.component.html',
  styleUrls: ['./flow-stats.component.css']
})
export class FlowStatsComponent implements OnInit {
  @Input() flowStats:      I_FlowStats
  @Input() displayVerbose: boolean
  @Input() showTpv:        boolean
  
  constructor() { }

  ngOnInit(): void {
  }

}
