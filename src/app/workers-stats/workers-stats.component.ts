import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { I_WorkerState } from '../shared/io_api_definitions';

@Component({
  selector: 'app-workers-stats',
  templateUrl: './workers-stats.component.html',
  styleUrls: ['./workers-stats.component.css']
})
export class WorkersStatsComponent implements OnInit, OnChanges {
  @Input() wosStats: I_WorkerState[]
  constructor() { }

  ngOnInit(): void {
//  console.log("WorkersStatsComponent.wosStats")
//  console.log(this.wosStats)
  }

  ngOnChanges(): void {
    this.wosStats = this.wosStats.sort((a, b) => a.worker < b.worker ? -1 : 1)
  }
}
