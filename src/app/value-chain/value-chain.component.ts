import { Component, OnInit, OnChanges, Input, ChangeDetectionStrategy, TrackByFunction } from '@angular/core'
import { Injection, ProcessStepId, PsWorkerUtilization, PsExtended, VcExtended, I_ProcessStepStatistics, WorkerWithUtilization, I_WorkItemStatistics } from '../shared/io_api_definitions'
import { ColorMapperService, RgbColor } from '../shared/color-mapper.service'
import { WorkorderFeederService  } from '../shared/workorder-feeder.service'
import { UiBoxSize, UiVcBoxLeftMargin} from '../shared/ui-boxes-definitions'
import { I_FlowStats } from '../shared/flow-stats-definitions'

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
  
  workitemStats:        I_WorkItemStatistics | undefined
  pssExtended:          PsExtended[]
  vcFlowStats:          I_FlowStats
  valueChainColor:      RgbColor | undefined

  constructor(private cms: ColorMapperService,
              private wof: WorkorderFeederService) { 
    console.log("Value-Chain: constructor()")
  }
 
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

  ngOnChanges(): void {
    this.workitemStats = this.vcExtended.flowStats?.stats?.vc
    this.pssExtended = this.vcExtended.vc.processSteps
                                  .map(ps => { return {
                                    ps: ps,
                                    vcId: this.vcExtended.vc.id,
                                    wosUtil: this.workersWithUtilOfProcessStep(ps.id),
                                    flowStats:this.flowStatsOfProcessStep(ps.id)
                                  }})
    this.calcSizeOfProcessStepBox()
  }
  
  feedParmsInputHandler(e: Event) {
    this.wof.setInjectionParms(this.vcExtended.vc.id, this.feedParms!)
  }

  private flowStatsOfProcessStep(psId: ProcessStepId): I_ProcessStepStatistics | undefined {
    const aux = this.vcExtended.flowStats?.stats.pss.find(psFlowStats => psFlowStats.id == psId)
    return aux
  }

  public identify(index: number, psExt: PsExtended): ProcessStepId { // https://stackoverflow.com/questions/42108217/how-to-use-trackby-with-ngfor // https://upmostly.com/angular/using-trackby-with-ngfor-loops-in-angular // https://angular.io/api/common/NgFor
    //console.log("Value-Chain: identify() returning psExt.ps.id = " + psExt.ps.id )
    return psExt.ps.id
  } 


  // ----- (re-)sizing of childs' UI boxes  -------------
  psBoxSize:          UiBoxSize // = { width: 0, height: 0 }

  private calcSizeOfProcessStepBox(): void {
    this.psBoxSize = { 
      width:  Math.round((this.vcBoxSize.width - UiVcBoxLeftMargin) / this.vcExtended.vc.processSteps.length),
      height: this.vcBoxSize.height
    }
  }

  private workersWithUtilOfProcessStep(ps: ProcessStepId): WorkerWithUtilization[] {
    return this.vcExtended.wosUtil.filter((woUtil: PsWorkerUtilization) => woUtil.assignedProcessSteps.some(_ps => _ps == ps))
                                        .map((woUtil: PsWorkerUtilization) => { 
                                          return  { worker:                     woUtil.worker, 
                                                    utilization:                woUtil.utilization}})
  }
}
