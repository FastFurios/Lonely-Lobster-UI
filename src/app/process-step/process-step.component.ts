import { Component, OnInit, OnChanges, Input } from '@angular/core'
import { I_WorkItem, PsExtended, I_ProcessStepStatistics } from '../shared/io_api_definitions'
import { ColorMapperService } from '../shared/color-mapper.service'
import { UiBoxSize, UiPsHeaderHeight, UiInvWidthOfPsWidth, UiInventoryBoxHeightShrink, UiWorkerNameHeight} from '../shared/ui-boxes-definitions'

@Component({
  selector: 'app-process-step',
  templateUrl: './process-step.component.html',
  styleUrls: ['./process-step.component.css']
})
export class ProcessStepComponent implements OnInit, OnChanges {
  @Input() psExtended: PsExtended
  @Input() vcStats:    I_ProcessStepStatistics
  @Input() psBoxSize:  UiBoxSize
  @Input() invVisible: boolean
  wis:                 I_WorkItem[]

  constructor(private cms: ColorMapperService) { }

  ngOnInit(): void {
    this.wis = this.psExtended.ps.workItems.map(wi =>  { 
      return  { 
                ...wi,
                rgbColor: this.cms.colorOfObject("value-chain", wi.valueChainId)
              }
    })
    this.calcSizeOfUiBoxes()
  }

  ngOnChanges(): void {
    this.psExtended.wosUtil.sort((w1, w2) => w1.worker < w2.worker ? -1 : 1 )
    this.calcSizeOfUiBoxes()
    console.log("processStep.ngOnChanges(): this.invVisible = " + this.invVisible)
  }

  // ----- (re-)sizing of childs' UI boxes  -------------
  inventoryBoxSize:   UiBoxSize
  flowArrowBoxSize:   UiBoxSize
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
