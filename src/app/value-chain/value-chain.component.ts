import { Component, OnInit, OnChanges, Input } from '@angular/core'
import { Options } from '@angular-slider/ngx-slider'
import { I_ValueChain } from '../shared/io_api_definitions'
import { ColorMapperService, RgbColor } from '../shared/color-mapper.service'
import { WorkorderFeederService } from '../shared/workorder-feeder.service'

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
  valueChainColor: RgbColor
  psBoxSize: UiBoxSize = { width: 0, height: 0 }

  constructor(private cms: ColorMapperService,
              private wof: WorkorderFeederService) { }
 
  ngOnInit(): void {
    this.valueChainColor = this.cms.colorOfObject(["value-chain", this.vc.id])
    this.calcSizeOfProcessStepBox()  
    this.wof.setParms(this.vc.id, 1, 0.7)
  }

  ngOnChanges(): void {
    console.log("ValueChainComponent: vcBoxSize changed")
    this.calcSizeOfProcessStepBox()
  }
  
  private calcSizeOfProcessStepBox(): void {
    this.psBoxSize = { 
      width:  Math.round(this.vcBoxSize.width / this.vc.processSteps.length),
      height: this.vcBoxSize.height 
    }
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
