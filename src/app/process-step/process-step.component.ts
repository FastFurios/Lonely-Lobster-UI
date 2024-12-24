//-------------------------------------------------------------------
// PROCESS STEP COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 22.12.2024

import { Component, OnInit, OnChanges, Input } from '@angular/core'
import { I_WorkItem } from '../shared/io_api_definitions'
import { PsExtended } from '../shared/frontend_definitions'

import { ColorMapperService } from '../shared/color-mapper.service'
import { UiBoxSize, UiPsHeaderHeight, UiInvWidthOfPsWidth, UiInventoryBoxHeightShrink, UiWorkerNameHeight} from '../shared/ui-boxes-definitions'
import { WorkorderFeederService } from '../shared/workorder-feeder.service'

/**
 * @class This Angular component renders the display of a process step.
 */
@Component({
  selector: 'app-process-step',
  templateUrl: './process-step.component.html',
  styleUrls: ['./process-step.component.css']
})
export class ProcessStepComponent implements OnInit, OnChanges {
  @Input() psExtended: PsExtended
  @Input() psBoxSize:  UiBoxSize
  /** inventory is only shown if true */
  @Input() invVisible: boolean
  /** workitems in the process step prepared for displaying */
  wis:                 I_WorkItem[]

  constructor(private cms: ColorMapperService,
              private wof: WorkorderFeederService) { 
  }

  /** on component initialization set wip limits and calculate display area size */
  ngOnInit(): void {
    this.wof.setWipLimit(this.psExtended.vcId, this.psExtended.ps.id, this.psExtended.ps.wipLimit)
    this.calcSizeOfUiBoxes()
  }

  /** on changes update work items for display, add utilization statistics to t,he workers and adjust the display area size if necessary */
  ngOnChanges(): void {
    this.psExtended.wosUtil.sort((w1, w2) => w1.worker < w2.worker ? -1 : 1 )
    this.wis = this.psExtended.ps.workItems.map(wi =>  { 
      return  { 
                ...wi,
                rgbColor: this.cms.colorOfObject("value-chain", wi.valueChainId)
              }
    })
    this.wof.setWipLimit(this.psExtended.vcId, this.psExtended.ps.id, this.psExtended.ps.wipLimit)
    this.calcSizeOfUiBoxes()
  }

  /** if changed by user on the UI adjust WIP limit in the work order feeder service */
  public wipLimitHandler() {
    this.wof.setWipLimit(this.psExtended.vcId, this.psExtended.ps.id, this.psExtended.ps.wipLimit)
  }

  // ----- (re-)sizing of childs' UI boxes  -------------
  inventoryBoxSize:   UiBoxSize
  flowArrowBoxSize:   UiBoxSize
  uiPsHeaderHeight    = UiPsHeaderHeight
  uiWorkerNameHeight  = UiWorkerNameHeight

  /** calculate the display area of the process step's inventory */
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
