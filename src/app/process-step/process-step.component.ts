import { Component, OnInit, OnChanges, Input } from '@angular/core'
import { I_WorkItem, PsExtended, I_ProcessStepStatistics, WipLimit } from '../shared/io_api_definitions'
import { ColorMapperService } from '../shared/color-mapper.service'
import { UiBoxSize, UiPsHeaderHeight, UiInvWidthOfPsWidth, UiInventoryBoxHeightShrink, UiWorkerNameHeight} from '../shared/ui-boxes-definitions'
import { WorkorderFeederService } from '../shared/workorder-feeder.service'

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
  wipLimit:            WipLimit = 0

  constructor(private cms: ColorMapperService,
              private wof: WorkorderFeederService) { 
    console.log("ProcessStep constructor()")
  }

  ngOnInit(): void {
    //console.log("ProcessStep ngOnInit() id= " + this.psExtended.ps.id)
    //this.wipLimit = this.psExtended.ps.wipLimit ? this.psExtended.ps.wipLimit : 0
    this.wof.setWipLimit(this.psExtended.vcId, this.psExtended.ps.id, this.wipLimit)
    this.calcSizeOfUiBoxes()
    //console.log("Process-Step = " + this.psExtended.ps.id + ", ngOnInit(): workitems.length = " + this.psExtended.ps.workItems.length)
  }

  ngOnChanges(): void {
    this.psExtended.wosUtil.sort((w1, w2) => w1.worker < w2.worker ? -1 : 1 )
//  this.assembleWipDisplay()
    this.wis = this.psExtended.ps.workItems.map(wi =>  { 
      return  { 
                ...wi,
                rgbColor: this.cms.colorOfObject("value-chain", wi.valueChainId)
              }
    })
    this.calcSizeOfUiBoxes()
    //console.log("Process-Step = " + this.psExtended.ps.id + ", ngOnChanges(): workitems.length = " + this.psExtended.ps.workItems.length)
  }

  public wipLimitHandler(newWipLimit: WipLimit) {
    console.log(`Process-Step: wipLimitHandler(${this.psExtended.vcId}, ${this.psExtended.ps.id}, ${newWipLimit})`)
    this.wof.setWipLimit(this.psExtended.vcId, this.psExtended.ps.id, newWipLimit.valueOf())
  }

  //private assembleWipDisplay(): void { this.wipLimitDisplay = this.psExtended.ps.wipLimit ? " of max. " + this.psExtended.ps.wipLimit : "" }

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
