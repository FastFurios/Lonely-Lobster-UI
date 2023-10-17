import { Component, OnChanges, Input } from '@angular/core'
import { I_WorkerState } from '../shared/io_api_definitions'
import { WorkerWithUtilization } from '../shared/io_api_definitions'

@Component({
  selector: 'app-worker',
  templateUrl: './worker.component.html',
  styleUrls: ['./worker.component.css']
})
export class WorkerComponent implements OnChanges {
  @Input() woStats: I_WorkerState
  woUtil:           WorkerWithUtilization

  constructor() { }

  ngOnChanges(): void {
    this.woUtil = {
        worker:       this.woStats.worker,
        utilization:  this.woStats.utilization
      } 
    this.woStats.worker       = this.woStats.worker.padEnd(20).substring(0, 10)
    this.woStats.utilization  = Math.round(this.woStats.utilization)
  }
}
