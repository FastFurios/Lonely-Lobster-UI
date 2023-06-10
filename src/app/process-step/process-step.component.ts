import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { I_ProcessStep, I_WorkItem } from '../shared/io_api_definitions'
import { RgbColor } from '../shared/color-mapper.service'
import { ColorMapperService } from '../shared/color-mapper.service'
import { UiBoxSize, UiPsHeaderHeight, UiInvWidthOfPsWidth} from '../shared/ui-boxes-definitions';


@Component({
  selector: 'app-process-step',
  templateUrl: './process-step.component.html',
  styleUrls: ['./process-step.component.css']
})
export class ProcessStepComponent implements OnInit, OnChanges {
  @Input() ps:        I_ProcessStep
  @Input() psBoxSize: UiBoxSize
  wis:                I_WorkItem[]

  constructor(private cms: ColorMapperService) { }

  ngOnInit(): void {
    //console.log("ProcessStepComponent: ngOnInit()")
    this.wis = this.ps.workItems.map(wi =>  { 
      return  { 
                ...wi,
                rgbColor: this.cms.colorOfObject(["value-chain", wi.valueChainId])
              }
    })
    this.calcSizeOfUiBoxes()
  }

  ngOnChanges(): void {
    //console.log("ProcessStepComponent:psBoxSize changed")
    this.calcSizeOfUiBoxes()
  }


  // ----- (re-)sizing of childs' UI boxes  -------------

  inventoryBoxSize: UiBoxSize
  flowArrowBoxSize: UiBoxSize
  uiPsHeaderHeight = UiPsHeaderHeight

  private calcSizeOfUiBoxes(): void {
    this.inventoryBoxSize = {
      width:  this.psBoxSize.width * UiInvWidthOfPsWidth,
      height: this.psBoxSize.height - UiPsHeaderHeight
    }
    this.flowArrowBoxSize = {
      width:  this.psBoxSize.width - this.inventoryBoxSize.width ,
      height: this.inventoryBoxSize.height
    }
  }

}
