import { Component, OnChanges, Input } from '@angular/core'
import { I_WorkerState } from '../shared/io_api_definitions'
import { ColorMapperService } from '../shared/color-mapper.service'
import { rgbColorToCssString, textColorAgainstBackground } from '../shared/inventory-layout'

type ColorLegendItem = {
  id:               string
  backgroundColor:  string // CSS color string
  textColor:        string // CSS color string
}

@Component({
  selector: 'app-workers-stats',
  templateUrl: './workers-stats.component.html',
  styleUrls: ['./workers-stats.component.css']
})
export class WorkersStatsComponent implements OnChanges {
  @Input() wosStats:        I_WorkerState[]
  colorLegend:              ColorLegendItem[] = []
  numWorkerSignalsReceived: number = 0

  constructor(private cms: ColorMapperService) { }

  ngOnChanges(): void {
    this.wosStats = this.wosStats.sort((a, b) => a.worker < b.worker ? -1 : 1)  //sort workers by name asc
  }

  public workerGotColorsAssignedHandler(e: any): void {
    this.numWorkerSignalsReceived++
    if (this.numWorkerSignalsReceived >= this.wosStats.length)
      this.fillColorLegend()
  }

  private fillColorLegend(): void {
    const objColMap = this.cms.allAssignedColors("selection-strategy")
    if (!objColMap) {
      console.log("WorkerStats: fillColorLegend(): objColMap is undefined")
      return
    }
    this.colorLegend = []
    for (let e of objColMap.entries()) {
      this.colorLegend.push({ 
        id:               e[0], 
        backgroundColor:  rgbColorToCssString(e[1]),
        textColor:        rgbColorToCssString(textColorAgainstBackground(e[1]))
      } )  
    }
  }
}
