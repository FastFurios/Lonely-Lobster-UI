import { Component, OnInit, OnChanges, Input } from '@angular/core'
import { I_WorkerState } from '../shared/io_api_definitions'
import { ColorMapperService } from '../shared/color-mapper.service'
import { cssColorListSest } from '../shared/inventory-layout'

@Component({
  selector: 'app-workers-stats',
  templateUrl: './workers-stats.component.html',
  styleUrls: ['./workers-stats.component.css']
})
export class WorkersStatsComponent implements OnChanges {
  @Input() wosStats: I_WorkerState[]

  constructor(private cms: ColorMapperService) { 
    cms.addCategory("selection-strategy", cssColorListSest)
  }

  ngOnChanges(): void {
    this.wosStats = this.wosStats.sort((a, b) => a.worker < b.worker ? -1 : 1)
  }
}
