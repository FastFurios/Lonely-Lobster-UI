import { Component, OnChanges, Input } from '@angular/core'
import { I_WorkerState, I_WeightedSelectionStrategy, WorkerWithUtilization } from '../shared/io_api_definitions'
import { ColorMapperService } from '../shared/color-mapper.service'
import { rgbColorToCssString } from '../shared/inventory-layout'

type WeightedColoredSelectionStrategy = I_WeightedSelectionStrategy & {
  color: string // string with css color codes 
}

@Component({
  selector: 'app-worker',
  templateUrl: './worker.component.html',
  styleUrls: ['./worker.component.css']
})
export class WorkerComponent implements OnChanges {
  @Input() woStats:       I_WorkerState
  woUtil:                 WorkerWithUtilization
  woWeigthColorSests:     WeightedColoredSelectionStrategy[] 

  constructor(private cms: ColorMapperService) { }

  ngOnChanges(): void {
    this.woUtil = {
        worker:                       this.woStats.worker,
        utilization:                  this.woStats.utilization
      } 
    this.woStats.worker       = this.woStats.worker.padEnd(20).substring(0, 10)
    this.woStats.utilization  = Math.round(this.woStats.utilization)
    this.woWeigthColorSests   = this.woStats.weightedSelectionStrategies.map(wsest => { 
      return {
        ...wsest,
        color: rgbColorToCssString(this.cms.colorOfObject("selection-strategy", wsest.id)!)
      }})  
  }
}
