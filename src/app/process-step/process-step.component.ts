import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { I_ProcessStep, I_WorkItem } from '../shared/io_api_definitions'
import { RgbColor } from '../shared/color-mapper.service'
import { ColorMapperService } from '../shared/color-mapper.service'

type UiBoxSize = {
  width:  number
  height: number
}

const arrowWidth = 100

@Component({
  selector: 'app-process-step',
  templateUrl: './process-step.component.html',
  styleUrls: ['./process-step.component.css']
})
export class ProcessStepComponent implements OnInit, OnChanges {
  @Input() ps: I_ProcessStep
  @Input() psBoxSize: UiBoxSize
  wis: I_WorkItem[]
  inventoryBoxSize: UiBoxSize

  constructor(private cms: ColorMapperService) { }

  ngOnInit(): void {
    //console.log("ProcessStepComponent: ngOnInit()")
    this.wis = this.ps.workItems.map(wi =>  { 
      return  { 
                ...wi,
                rgbColor: this.cms.colorOfObject(["value-chain", wi.valueChainId])
              }
    })
    this.calcSizeOfInventoryBox()
  }

  ngOnChanges(): void {
    //console.log("ProcessStepComponent:psBoxSize changed")
    this.calcSizeOfInventoryBox()
  }

  private calcSizeOfInventoryBox(): void {
    this.inventoryBoxSize = {
      width:  this.psBoxSize.width - arrowWidth,
      height: this.psBoxSize.height
    }
  }

}
