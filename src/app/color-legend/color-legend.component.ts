//-------------------------------------------------------------------
// COLOR LEGEND COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 21.12.2024

import { Component, Input, OnInit } from '@angular/core'
import { ColorMapperService, ColorLegendItem, ColoringCategory } from '../shared/color-mapper.service'
import { rgbColorToCssString, textColorAgainstBackground } from '../shared/inventory-layout'

/**
 * @class This Angular component shows the color legend of the globally defined work item selection strategies. 
 */
@Component({
  selector: 'app-color-legend',
  templateUrl: './color-legend.component.html',
  styleUrls: ['./color-legend.component.css']
})
export class ColorLegendComponent implements OnInit {
  /** indicates if legend should be reloaded and displayed */
  @Input() reload:    boolean
  /** color category for which the Color Mapper service assigns colors */
  @Input() colorCat:  ColoringCategory
  /** color map array for display in the html template */
  colorLegend:        ColorLegendItem[]

  constructor(private cms: ColorMapperService) { }

  ngOnInit(): void { 
    this.fillColorLegend() 
  }

  ngOnChanges(): void {
    if (this.reload) this.fillColorLegend()
  }

  /** fill the color map array for display in the html template */
  private fillColorLegend(): void {
    const objColMap = this.cms.allAssignedColors(this.colorCat)
    if (!objColMap) {
      console.log("ColorLegend: fillColorLegend(): objColMap is undefined")
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
