//-------------------------------------------------------------------
// FLOW STATISTICS COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 21.12.2024

import { Component, Input, OnInit } from '@angular/core'
import { I_WorkItemStatistics } from '../shared/io_api_definitions'

/** flow statistics  */
export interface I_FlowStatsDisplay {
  tpv: string,  // throughput measured in value
  tpi: string,  // throughput measured in #items
  ct:  string   // cycle time
}

/**
 * @class This Angular component displays the flow statistics i.e. cycle time (ct), throughput measured in #work items (tpi) and based on the work items value (tpv). 
 */
@Component({
  selector: 'app-flow-stats',
  templateUrl: './flow-stats.component.html',
  styleUrls: ['./flow-stats.component.css']
})
export class FlowStatsComponent implements OnInit {
  @Input() workitemStats?: I_WorkItemStatistics
  /** when true display labels ct, tpi, tpv */
  @Input() displayVerbose: boolean
  /** display tpv */
  @Input() showTpv:        boolean
  flowStatsDisplay:        I_FlowStatsDisplay

  /** @private */
  constructor() { }
  /** @private */
  ngOnInit(): void { }

  ngOnChanges(): void { 
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
  }
}
