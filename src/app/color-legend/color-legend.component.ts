//-------------------------------------------------------------------
// COLOR LEGEND COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 21.12.2024

import { Component, Input, OnInit } from '@angular/core'
import { ColorMapperService, ColorLegendItem, ColoringCategory } from '../shared/color-mapper.service'
import { rgbColorToCssString, textColorAgainstBackground } from '../shared/inventory-layout'

/**
 * @class This Angular shows the color legend of the globally defined work item selection strategies. 
 */
@Component({
  selector: 'app-color-legend',
  templateUrl: './color-legend.component.html',
  styleUrls: ['./color-legend.component.css']
})
export class ColorLegendComponent implements OnInit {
  /** Indicates if legend should be reloaded i.e. displayed */
  @Input() reload:    boolean
  /** Color category for which the Color Mapper service assigns colors to this category*/
  @Input() colorCat:  ColoringCategory
  /** Color map array for display in the template */
  colorLegend:        ColorLegendItem[]

  /** @private */  
  constructor(private cms: ColorMapperService) { }

  /** @private */  
  ngOnInit(): void { 
    this.fillColorLegend() 
  }

  /** If reload indicator changes fill the color legend  */  
  ngOnChanges(): void {
    if (this.reload) this.fillColorLegend()
  }

  /** Fill the color map array for display in the template */
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
