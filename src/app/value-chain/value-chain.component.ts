import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core'
import { I_ValueChain, ProcessStepId, PsWorkerUtilization, PsWithWorkersWithUtil, VcWithWorkersUtil, WorkerWithUtilization } from '../shared/io_api_definitions'
import { ColorMapperService, RgbColor } from '../shared/color-mapper.service'
import { WorkorderFeederService, VcFeederParms } from '../shared/workorder-feeder.service'
import { UiBoxSize, UiVcBoxLeftMargin} from '../shared/ui-boxes-definitions';


@Component({
  selector: 'app-value-chain',
  templateUrl: './value-chain.component.html',
  styleUrls: ['./value-chain.component.css']
})
export class ValueChainComponent implements OnInit, OnChanges {
  @Input() vcWu:      VcWithWorkersUtil  
  @Input() vcBoxSize: UiBoxSize
  feedParms:          VcFeederParms // = { avgInjectionThroughput: 0, injectProbability: 0 }
  
  pssWithWorkersWithUtil: PsWithWorkersWithUtil[]
  
  valueChainColor:    RgbColor

  constructor(private cms: ColorMapperService,
              private wof: WorkorderFeederService) { }
 
  ngOnInit(): void {
//  console.log("ValueChainComponent: ngOnInit() this.vcBoxSize=")
//  console.log(this.vcBoxSize)

    //console.log("ValueChainComponent "+this.vc.id + ": ngOnInit()")
    this.valueChainColor = this.cms.colorOfObject(["value-chain", this.vcWu.vc.id])
    this.calcSizeOfProcessStepBox()  

    const fp = this.wof.getParms(this.vcWu.vc.id)
//  console.log("ValueChainComponent: fp=")
//  console.log(fp)
   
    this.feedParms = fp ?  fp : { avgInjectionThroughput: 1, injectProbability: 1 }
    this.wof.setParms(this.vcWu.vc.id, this.feedParms.avgInjectionThroughput, this.feedParms.injectProbability)
  }

  ngOnChanges(/*changes: SimpleChanges*/): void {

    this.pssWithWorkersWithUtil = this.vcWu.vc.processSteps
                                  .map(ps => { return {
                                    ps: ps,
                                    wosUtil: this.workersWithUtilOfProcessStep(ps.id)
                                  }})

    //console.log("ValueChainComponent "+this.vc.id + ": ngOnChanges(): simple change=")
    //console.log(changes)
    this.calcSizeOfProcessStepBox()

    if (!this.feedParms) return
    if (this.feedParms!.avgInjectionThroughput > 0 && this.feedParms!.injectProbability > 0) this.wof.setParms(this.vcWu.vc.id, this.feedParms!.avgInjectionThroughput, this.feedParms!.injectProbability)
  }
  
  feedParmsInputHandler(e: Event) {
    //console.log("ValueChainComponent.feedParmsInputHandler(e): this.feedParms=")
    //console.log(this.feedParms)
    this.wof.setParms(this.vcWu.vc.id, this.feedParms!.avgInjectionThroughput, this.feedParms!.injectProbability)
  }

  // ----- (re-)sizing of childs' UI boxes  -------------
  psBoxSize:          UiBoxSize // = { width: 0, height: 0 }

  private calcSizeOfProcessStepBox(): void {
    this.psBoxSize = { 
      width:  Math.round((this.vcBoxSize.width - UiVcBoxLeftMargin) / this.vcWu.vc.processSteps.length),
      height: this.vcBoxSize.height
    }
  }

  private workersWithUtilOfProcessStep(ps: ProcessStepId): WorkerWithUtilization[] {
    const aux: WorkerWithUtilization[] = this.vcWu.wosUtil.filter((woUtil: PsWorkerUtilization) => woUtil.assignedProcessSteps.some(_ps => _ps == ps))
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
