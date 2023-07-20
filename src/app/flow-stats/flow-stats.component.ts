import { Component, Input, OnInit } from '@angular/core';
import { I_FlowStats } from '../shared/flow-stats-definitions';
import { I_WorkItemStatistics } from '../shared/io_api_definitions'


export interface I_FlowStatsDisplay {
  tpv: string,  // throughput measured in value
  tpi: string,  // throughput measured in #items
  ct:  string   // cycle time
}

@Component({
  selector: 'app-flow-stats',
  templateUrl: './flow-stats.component.html',
  styleUrls: ['./flow-stats.component.css']
})
export class FlowStatsComponent implements OnInit {
  @Input() workitemStats?:  I_WorkItemStatistics
  @Input() displayVerbose: boolean
  @Input() showTpv:        boolean
  @Input() vertical:       boolean
  flowStatsDisplay: I_FlowStatsDisplay

  constructor() { }

  ngOnInit(): void { }

  ngOnChanges(): void { 
//  console.log("FlowStatsComponent.ngOnChanges().workItemStats=")
//    console.log(this.workitemStats)
    if (this.workitemStats)  
      this.flowStatsDisplay = { 
        ct:  this.workitemStats.cycleTime.avg ? (Math.round(this.workitemStats.cycleTime.avg * 10 ) / 10).toString() : "-",
        tpi: this.workitemStats.throughput.itemsPerTimeUnit ? (Math.round(this.workitemStats.throughput.itemsPerTimeUnit * 10 ) / 10).toString() : "-",
        tpv: this.workitemStats.throughput.valuePerTimeUnit ? (Math.round(this.workitemStats.throughput.valuePerTimeUnit * 10 ) / 10).toString() : "-",
      }
    else 
      this.flowStatsDisplay = { 
        ct:  "-",
        tpi: "-",
        tpv: "-"
      }
//    console.log("FlowStatsComponent.ngOnChanges().flowStatsDisplay=")
//    console.log(this.flowStatsDisplay)
  }

}
