import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { I_ProcessStep, I_WorkItem, PsWithWorkersWithUtil, I_ProcessStepStatistics } from '../shared/io_api_definitions'
//import { RgbColor } from '../shared/color-mapper.service'
import { ColorMapperService } from '../shared/color-mapper.service'
import { UiBoxSize, UiPsHeaderHeight, UiInvWidthOfPsWidth, UiInventoryBoxHeightShrink, UiWorkerNameHeight} from '../shared/ui-boxes-definitions';


@Component({
  selector: 'app-process-step',
  templateUrl: './process-step.component.html',
  styleUrls: ['./process-step.component.css']
})
export class ProcessStepComponent implements OnInit, OnChanges {
  @Input() psWu:      PsWithWorkersWithUtil
  @Input() vcStats:   I_ProcessStepStatistics
  @Input() psBoxSize: UiBoxSize
  wis:                I_WorkItem[]

  constructor(private cms: ColorMapperService) { }

  ngOnInit(): void {
    this.wis = this.psWu.ps.workItems.map(wi =>  { 
      return  { 
                ...wi,
                rgbColor: this.cms.colorOfObject(["value-chain", wi.valueChainId])
              }
    })
    this.calcSizeOfUiBoxes()
  }

  ngOnChanges(): void {
    this.psWu.wosUtil.sort((w1, w2) => w1.worker < w2.worker ? -1 : 1 )
//    console.log("ProcessStepComponent.ngOnChanges(): psWu=")
//    console.log(this.psWu)
    //console.log("ProcessStepComponent:psBoxSize changed")
    this.calcSizeOfUiBoxes()
  }


  // ----- (re-)sizing of childs' UI boxes  -------------

  inventoryBoxSize: UiBoxSize
  flowArrowBoxSize: UiBoxSize
  uiPsHeaderHeight    = UiPsHeaderHeight
  uiWorkerNameHeight  = UiWorkerNameHeight

  private calcSizeOfUiBoxes(): void {
    this.inventoryBoxSize = {
      width:  this.psBoxSize.width * UiInvWidthOfPsWidth,
      height: this.psBoxSize.height * UiInventoryBoxHeightShrink - UiPsHeaderHeight - UiWorkerNameHeight
    }
    this.flowArrowBoxSize = {
      width:  this.psBoxSize.width - this.inventoryBoxSize.width ,
      height: this.inventoryBoxSize.height
    }
  }

}
