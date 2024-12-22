//-------------------------------------------------------------------
// VALUE CHAIN COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 22.12.2024

import { Component, OnInit, OnChanges, Input, ChangeDetectionStrategy, TrackByFunction } from '@angular/core'
import { Injection, ProcessStepId, PsWorkerUtilization, PsExtended, VcExtended, I_ProcessStepStatistics, WorkerWithUtilization, I_WorkItemStatistics, I_FlowStats } from '../shared/io_api_definitions'
import { ColorMapperService, RgbColor } from '../shared/color-mapper.service'
import { WorkorderFeederService  } from '../shared/workorder-feeder.service'
import { UiBoxSize, UiVcBoxLeftMargin} from '../shared/ui-boxes-definitions'

/**
 * @class This Angular component renders a value-chain.
 */
@Component({
  selector: 'app-value-chain',
  templateUrl: './value-chain.component.html',
  styleUrls: ['./value-chain.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush  
})
export class ValueChainComponent implements OnInit, OnChanges {
  @Input() vcExtended:  VcExtended
  @Input() vcBoxSize:   UiBoxSize
  @Input() invVisible:  boolean
  feedParms:            Injection | undefined = undefined
  
  vcStats:              I_WorkItemStatistics | undefined
  /** list of extended process-step data structures  */
  pssExtended:          PsExtended[]
  /** value-chain flow statistics  */
  vcFlowStats:          I_FlowStats
  valueChainColor:      RgbColor | undefined

  constructor(private cms: ColorMapperService,
              private wof: WorkorderFeederService) { 
  }
 
  /** on component initialization, set the workorder feeding parameters: if not yet defined in this component, take them from the work order feeder service. If there not defined either take the 
   * values from the iteration request and update the workorder feeder; get the value-chain color 
   */
  ngOnInit(): void {
    if (this.feedParms) {
      this.wof.setInjectionParms(this.vcExtended.vc.id, this.feedParms)
    }
    else {
      this.feedParms = this.wof.getInjectionParms(this.vcExtended.vc.id)
      if (!this.feedParms) {
        this.wof.setInjectionParms(this.vcExtended.vc.id, this.vcExtended.vc.injection)
        this.feedParms = this.vcExtended.vc.injection
      }
    }
    this.valueChainColor = this.cms.colorOfObject("value-chain", this.vcExtended.vc.id)
    this.calcSizeOfProcessStepBox()  
  }

  /**
   * on changes, update flow statistics of value chain and its process steps 
   */
  ngOnChanges(): void {
    this.vcStats = this.vcExtended.flowStats?.stats?.vc
    this.pssExtended = this.vcExtended.vc.processSteps
                                  .map(ps => { return {
                                    ps: ps,
                                    vcId: this.vcExtended.vc.id,
                                    wosUtil: this.workersWithUtilOfProcessStep(ps.id),
                                    flowStats:this.flowStatsOfProcessStep(ps.id)
                                  }})
    this.calcSizeOfProcessStepBox()
  }
  
  /** when user changes feeding parameters, update work order feeder service */
  public feedParmsInputHandler(e: Event) {
    this.wof.setInjectionParms(this.vcExtended.vc.id, this.feedParms!)
  }

  /** return flow statistics of the value chain's process steps */
  private flowStatsOfProcessStep(psId: ProcessStepId): I_ProcessStepStatistics | undefined {
    return this.vcExtended.flowStats?.stats.pss.find(psFlowStats => psFlowStats.id == psId)
  }

  /**    
   * when rendering the process steps in the *ngFor loop, help Angular runtime to avoid re-rendering the html element for all process steps, instead only for process steps where the id was changed 
   * i.e. a new system with other process steps was built
   * @param index - unused
   * @param psExt - process step extended data structure
   * @returns process step id 
   */
  public identify(index: number, psExt: PsExtended): ProcessStepId {
    return psExt.ps.id
  } 

  // ---------------------------------------------------------------------------------------
  // (re-)sizing of childs' UI boxes  
  // ---------------------------------------------------------------------------------------
  psBoxSize:          UiBoxSize // = { width: 0, height: 0 }

  /** calculate UI boxes' sizes */
  private calcSizeOfProcessStepBox(): void {
    this.psBoxSize = { 
      width:  Math.round((this.vcBoxSize.width - UiVcBoxLeftMargin) / this.vcExtended.vc.processSteps.length),
      height: this.vcBoxSize.height
    }
  }

  /** extract workers with utilizations from the extended value chain data structure */
  private workersWithUtilOfProcessStep(ps: ProcessStepId): WorkerWithUtilization[] {
    return this.vcExtended.wosUtil.filter((woUtil: PsWorkerUtilization) => woUtil.assignedProcessSteps.some(_ps => _ps == ps))
                                        .map((woUtil: PsWorkerUtilization) => { 
                                          return  { worker:                     woUtil.worker, 
                                                    utilization:                woUtil.utilization}})
  }
}
