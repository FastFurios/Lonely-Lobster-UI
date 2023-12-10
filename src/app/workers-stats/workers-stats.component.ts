import { Component, AfterViewInit, OnChanges, Input } from '@angular/core'
import { I_WorkerState } from '../shared/io_api_definitions'
import { ColorMapperService, ObjectColorMap } from '../shared/color-mapper.service'
import { cssColorListSest } from '../shared/inventory-layout'
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
export class WorkersStatsComponent implements AfterViewInit, OnChanges {
  @Input() wosStats: I_WorkerState[]
  colorLegend: ColorLegendItem[] = []

  constructor(private cms: ColorMapperService) { 
    cms.addCategory("selection-strategy", cssColorListSest)
  }

  ngAfterViewInit(): void {
    const objColMap = this.cms.allAssignedColors("selection-strategy")
    if (!objColMap) {
      return
    }
    console.log("WorkerStats: ngOnInit(): objColMap.size = " + objColMap.size)
    for (let e of objColMap.entries()) {
      this.colorLegend.push({ 
        id:               e[0], 
        backgroundColor:  rgbColorToCssString(e[1]),
        textColor:        rgbColorToCssString(textColorAgainstBackground(e[1]))
      } )  

    }
  }

  ngOnChanges(): void {
    this.wosStats = this.wosStats.sort((a, b) => a.worker < b.worker ? -1 : 1)
  }
}
