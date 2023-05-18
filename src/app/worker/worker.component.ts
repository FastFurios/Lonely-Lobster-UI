import { Component, OnInit, Input } from '@angular/core';
import { I_WorkerState } from '../shared/io_api_definitions';

@Component({
  selector: 'app-worker',
  templateUrl: './worker.component.html',
  styleUrls: ['./worker.component.css']
})
export class WorkerComponent implements OnInit {
  @Input() woStats: I_WorkerState
 
  constructor() { }

  ngOnInit(): void {
//  console.log(`Before: Util of ${this.woStats.worker} is ${this.woStats.utilization}`)
    this.woStats.worker = this.woStats.worker.padEnd(20).substring(0, 10)
    this.woStats.utilization = Math.round(this.woStats.utilization)
//  console.log(`After: Util of ${this.woStats.worker} is ${this.woStats.utilization}`)
  }

}
