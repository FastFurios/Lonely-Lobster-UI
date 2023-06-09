import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core'
import { Options } from '@angular-slider/ngx-slider'
import { I_ValueChain } from '../shared/io_api_definitions'
import { ColorMapperService, RgbColor } from '../shared/color-mapper.service'
import { WorkorderFeederService, VcFeederParms } from '../shared/workorder-feeder.service'

type UiBoxSize = {
  width:  number
  height: number
}

@Component({
  selector: 'app-value-chain',
  templateUrl: './value-chain.component.html',
  styleUrls: ['./value-chain.component.css']
})
export class ValueChainComponent implements OnInit, OnChanges {
  @Input() vc: I_ValueChain  
  @Input() vcBoxSize: UiBoxSize
  feedParms: VcFeederParms = { avgInjectionThroughput: 0, injectProbability: 0 }

  valueChainColor: RgbColor
  psBoxSize: UiBoxSize = { width: 0, height: 0 }

  constructor(private cms: ColorMapperService,
              private wof: WorkorderFeederService) { }
 
  ngOnInit(): void {
    //console.log("ValueChainComponent "+this.vc.id + ": ngOnInit()")
    this.valueChainColor = this.cms.colorOfObject(["value-chain", this.vc.id])
    this.calcSizeOfProcessStepBox()  

    const fp = this.wof.getParms(this.vc.id)
//  console.log("ValueChainComponent: fp=")
//  console.log(fp)
   
    this.feedParms = fp ?  fp : { avgInjectionThroughput: 1, injectProbability: 1 }
    this.wof.setParms(this.vc.id, this.feedParms.avgInjectionThroughput, this.feedParms.injectProbability)
  }

  ngOnChanges(changes: SimpleChanges): void {
    
    //console.log("ValueChainComponent "+this.vc.id + ": ngOnChanges(): simple change=")
    //console.log(changes)
    this.calcSizeOfProcessStepBox()
    if (this.feedParms!.avgInjectionThroughput > 0 && this.feedParms!.injectProbability > 0) this.wof.setParms(this.vc.id, this.feedParms!.avgInjectionThroughput, this.feedParms!.injectProbability)
  }
  
  private calcSizeOfProcessStepBox(): void {
    this.psBoxSize = { 
      width:  Math.round(this.vcBoxSize.width / this.vc.processSteps.length),
      height: this.vcBoxSize.height 
    }
  }

  feedParmsInputHandler(e: Event) {
    console.log("ValueChainComponent.feedParmsInputHandler(e): this.feedParms=")
    console.log(this.feedParms)
    this.wof.setParms(this.vc.id, this.feedParms!.avgInjectionThroughput, this.feedParms!.injectProbability)
  }

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
}
