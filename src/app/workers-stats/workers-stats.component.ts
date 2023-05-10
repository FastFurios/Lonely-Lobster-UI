import { Component, OnInit, Input } from '@angular/core';
import { I_WorkerState } from '../shared/api-definitions';

@Component({
  selector: 'app-workers-stats',
  templateUrl: './workers-stats.component.html',
  styleUrls: ['./workers-stats.component.css']
})
export class WorkersStatsComponent implements OnInit {
  @Input() wosStats: I_WorkerState[]
  constructor() { }

  ngOnInit(): void {
//  console.log("WorkersStatsComponent.wosStats")
//  console.log(this.wosStats)
  }

}
