import { Component, OnInit, OnChanges, Input } from '@angular/core'
import { I_WorkerState } from '../shared/io_api_definitions'
import { ColorMapperService, ColorLegendItem } from '../shared/color-mapper.service'

@Component({
  selector: 'app-workers-stats',
  templateUrl: './workers-stats.component.html',
  styleUrls: ['./workers-stats.component.css']
})
export class WorkersStatsComponent implements OnChanges {
  @Input() wosStats:        I_WorkerState[]
  colorLegend:              ColorLegendItem[] = []
  numWorkerSignalsReceived: number            = 0
  showColorLegend:          boolean           = false

  constructor(private cms: ColorMapperService) { }

  ngOnInit(): void { }

  ngOnChanges(): void {
    this.wosStats = this.wosStats.sort((a, b) => a.worker < b.worker ? -1 : 1)  //sort workers by name asc
    this.showColorLegend = false
  }
  
  public workerGotColorsAssignedHandler(e: any): void {
    this.numWorkerSignalsReceived++
    this.showColorLegend = this.numWorkerSignalsReceived >= this.wosStats.length
  }
}
