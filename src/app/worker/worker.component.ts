import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { I_WorkerState, I_WeightedSelectionStrategy, WorkerWithUtilization } from '../shared/io_api_definitions'
import { ColorMapperService } from '../shared/color-mapper.service'
import { rgbColorToCssString } from '../shared/inventory-layout'

type WeightedColoredSelectionStrategy = I_WeightedSelectionStrategy & {
  backgroundColor: string // string with css color codes 
}

@Component({
  selector: 'app-worker',
  templateUrl: './worker.component.html',
  styleUrls: ['./worker.component.css']
})
export class WorkerComponent implements OnInit {
  @Input()  woStats:      I_WorkerState
  @Output() signalGotColorsAssigned = new EventEmitter<string>()
  woUtil:                 WorkerWithUtilization
  woWeigthColorSests:     WeightedColoredSelectionStrategy[] 

  constructor(private cms: ColorMapperService) { }

  ngOnInit(): void {
    this.woWeigthColorSests   = this.woStats.weightedSelectionStrategies.map(wsest => { 
      return {
        ...wsest,
        backgroundColor: rgbColorToCssString(this.cms.colorOfObject("selection-strategy", wsest.id)!)
      }})  
    this.signalGotColorsAssigned.emit(this.woStats.worker)

    this.woUtil = {
      worker:      this.woStats.worker,
      utilization: this.woStats.utilization
    } 
    this.woStats.worker       = this.woStats.worker.padEnd(20).substring(0, 10)
    this.woStats.utilization  = Math.round(this.woStats.utilization)
  }
}
