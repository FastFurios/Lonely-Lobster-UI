//-------------------------------------------------------------------
// WORKER COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 22.12.2024

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { I_WorkerState } from '../shared/io_api_definitions'
import { WorkerWithUtilization, ColoredWeightedSelectionStrategy } from '../shared/frontend_definitions'
import { ColorMapperService } from '../shared/color-mapper.service'
import { rgbColorToCssString } from '../shared/inventory-layout'

/**
 * @class This Angular component renders the display of a worker's utilization, current weighted selection strategies and the process steps he/she is assigned to.
 */
@Component({
  selector: 'app-worker',
  templateUrl: './worker.component.html',
  styleUrls: ['./worker.component.css']
})
export class WorkerComponent implements OnInit {
  @Input()  woStats:      I_WorkerState
  /** event emitter that signals the worker assigned colors to the work item selection strategies available to him/her */
  @Output() signalGotColorsAssigned = new EventEmitter<string>()
  /** utilization of worker */
  woUtil:                 WorkerWithUtilization
  /** the worker's weighted selection strategies with assigned display colors */
  woWeigthColorSests:     ColoredWeightedSelectionStrategy[] 

  constructor(private cms: ColorMapperService) { }

  /** 
   * on component initialization, assign a background color for all the strategies he/she uses; emit an event to the parent component "worker stats" that this worker has assigned colors for his/her strategies;
   * prepare display of values
   */
  ngOnInit(): void {
    this.woWeigthColorSests = this.woStats.weightedSelectionStrategies.map(wsest => { 
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
