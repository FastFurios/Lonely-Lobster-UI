import { Component, Input, OnInit } from '@angular/core'
import { ColorMapperService, ColorLegendItem, ColoringCategory } from '../shared/color-mapper.service'
import { rgbColorToCssString, textColorAgainstBackground } from '../shared/inventory-layout'

@Component({
  selector: 'app-color-legend',
  templateUrl: './color-legend.component.html',
  styleUrls: ['./color-legend.component.css']
})
export class ColorLegendComponent implements OnInit {
  @Input() colorCat:  ColoringCategory
  colorLegend:        ColorLegendItem[]
  
  constructor(private cms: ColorMapperService) { }

  ngOnInit(): void { 
    this.fillColorLegend() 
  }

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
