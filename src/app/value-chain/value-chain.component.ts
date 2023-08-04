import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core'
import { I_ValueChain, ProcessStepId, PsWorkerUtilization, PsExtended, VcExtended, I_ProcessStepStatistics, WorkerWithUtilization, I_ValueChainStatistics, I_WorkItemStatistics } from '../shared/io_api_definitions'
import { ColorMapperService, RgbColor } from '../shared/color-mapper.service'
import { WorkorderFeederService, VcFeederParms } from '../shared/workorder-feeder.service'
import { UiBoxSize, UiVcBoxLeftMargin} from '../shared/ui-boxes-definitions';
import { I_FlowStats } from '../shared/flow-stats-definitions';
import { ThisReceiver } from '@angular/compiler';


@Component({
  selector: 'app-value-chain',
  templateUrl: './value-chain.component.html',
  styleUrls: ['./value-chain.component.css']
})
export class ValueChainComponent implements OnInit, OnChanges {
  @Input() vcExtended:      VcExtended
  @Input() vcBoxSize: UiBoxSize
  feedParms:          VcFeederParms | undefined = undefined // { avgInjectionThroughput: 0, injectProbability: 0 }
  
  workitemStats:      I_WorkItemStatistics | undefined
  pssExtended:        PsExtended[]
  vcFlowStats:        I_FlowStats
  valueChainColor:    RgbColor


  constructor(private cms: ColorMapperService,
              private wof: WorkorderFeederService) { }
 
  ngOnInit(): void {
    //console.log("ValueChainComponent "+this.vc.id + ": ngOnInit()")

    if (this.feedParms) {
      //console.log("ValueChainComponent: ngOnInit(): setting wof to { avgInjectionThroughput: " + this.feedParms.avgInjectionThroughput + ", injectProbability:      1 }")
      this.wof.setParms(this.vcExtended.vc.id, this.feedParms.avgInjectionThroughput, this.feedParms.injectProbability)
    }
    else {
      this.feedParms = this.wof.getParms(this.vcExtended.vc.id)
      if (!this.feedParms) {
        //console.log("ValueChainComponent: ngOnInit(): setting this.feedparms AND wof to { avgInjectionThroughput: " + this.vcExtended.vc.injectionThroughput + ", injectProbability:      1 }")
        this.wof.setParms(this.vcExtended.vc.id, this.vcExtended.vc.injectionThroughput, 1)
        this.feedParms = { 
          avgInjectionThroughput: this.vcExtended.vc.injectionThroughput, 
          injectProbability:      1 
        }
      }
    }

//  console.log("ValueChainComponent: fp=")
//  console.log(fp)

//  console.log(this.vcBoxSize)

//  console.log("ValueChainComponent: ngOnInit() this.vcBoxSize=")
    this.valueChainColor = this.cms.colorOfObject(["value-chain", this.vcExtended.vc.id])
    this.calcSizeOfProcessStepBox()  

  }

  ngOnChanges(/*changes: SimpleChanges*/): void {
    this.workitemStats = this.vcExtended.flowStats?.stats?.vc
    //console.log("ValueChainComponent.ngOnChanges(): workitemStats=")
//    console.log(this.workitemStats)
    this.pssExtended = this.vcExtended.vc.processSteps
                                  .map(ps => { return {
                                    ps: ps,
                                    wosUtil: this.workersWithUtilOfProcessStep(ps.id),
                                    flowStats:this.flowStatsOfProcessStep(ps.id)
                                  }})
/*
  
    if (this.vcFlowStats) {
      this.vcFlowStats.tpv = Math.round(this.vcStats.stats.vc.throughput.valuePerTimeUnit * 10) / 10
      this.vcFlowStats.tpi = Math.round(this.vcStats.stats.vc.throughput.itemsPerTimeUnit * 10) / 10
      this.vcFlowStats.ct  = Math.round(this.vcStats.stats.vc.cycleTime.avg               * 10) / 10
    }
*/
    this.calcSizeOfProcessStepBox()
/*
    if (!this.feedParms) return
    if (this.feedParms!.avgInjectionThroughput > 0 && this.feedParms!.injectProbability > 0) this.wof.setParms(this.vcExtended.vc.id, this.feedParms!.avgInjectionThroughput, this.feedParms!.injectProbability)
*/
  }
  
  feedParmsInputHandler(e: Event) {
    //console.log("ValueChainComponent.feedParmsInputHandler(e): this.feedParms=")
    //console.log(this.feedParms)
    this.wof.setParms(this.vcExtended.vc.id, this.feedParms!.avgInjectionThroughput, this.feedParms!.injectProbability)
  }

  private flowStatsOfProcessStep(psId: ProcessStepId): I_ProcessStepStatistics | undefined {
    const aux = this.vcExtended.flowStats?.stats.pss.find(psFlowStats => psFlowStats.id == psId)
    return aux
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
    const aux: WorkerWithUtilization[] = this.vcExtended.wosUtil.filter((woUtil: PsWorkerUtilization) => woUtil.assignedProcessSteps.some(_ps => _ps == ps))
                                        .map((woUtil: PsWorkerUtilization) => { return { worker:               woUtil.worker, 
                                                                utilization:          woUtil.utilization }})

    //console.log("ValueChainComponent.workersUtilOfProcessStep(" + ps + ")=")                                                              
    //console.log(aux)
    return aux                                                              
  }


/*
  // https://angular-slider.github.io/ngx-slider/demos
  value: number = 1;
  options: Options = {
    floor: 0.1,
    ceil: 100,
    step: 0.1,
    logScale: true,
    showTicks: true,
    vertical: true,
//  tickStep: 10
  };

  doubleValue: number
  onSliderChange(): void {
    this.doubleValue = this.value * 2
  }
*/
}
