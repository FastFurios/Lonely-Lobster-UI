//-------------------------------------------------------------------
// WORKER STATISTICS COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 22.12.2024

import { Component, OnChanges, Input, ChangeDetectorRef } from '@angular/core'
import { I_WorkerState } from '../shared/io_api_definitions'
import { ColorMapperService, ColorLegendItem } from '../shared/color-mapper.service'

/**
 * @class This Angular component renders the worker components for all workers
 */
@Component({
  selector: 'app-workers-stats',
  templateUrl: './workers-stats.component.html',
  styleUrls: ['./workers-stats.component.css']
})
export class WorkersStatsComponent implements OnChanges {
  /** statistics of all workers */
  @Input() wosStats:        I_WorkerState[] 
  /** number of worker components that have finished their initializations i.e. have assigned colors to their available selection strategies */
  numWorkerSignalsReceived: number            = 0
  /** delay display of color legend until all workers have assigned colors to all of their available selection strategies */
  showColorLegend:          boolean           = false

  /** @private */
  constructor(private cdr: ChangeDetectorRef) { }
  /** @private */
  ngOnInit(): void { }

  /** on change, sort workers by name and set display of color legend to false */
  ngOnChanges(): void {
    this.wosStats = this.wosStats.sort((a, b) => a.worker < b.worker ? -1 : 1)  //sort workers by name asc
    this.showColorLegend = false
  }
  
  /** handle events from the worker components signalling that they finshed their initialization; when all worker components sent signals then show color legend */
  public workerGotColorsAssignedHandler(e: any): void {
    this.numWorkerSignalsReceived++
    this.showColorLegend = this.numWorkerSignalsReceived >= this.wosStats.length
    // this.cdr.detectChanges() // Resolve NG0100
  }
}
