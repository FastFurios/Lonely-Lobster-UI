import { Component, OnInit, Input } from '@angular/core'
import { Options } from '@angular-slider/ngx-slider'
import { I_ValueChain } from '../shared/io_api_definitions'
import { ColorMapperService, RgbColor } from '../shared/color-mapper.service'


@Component({
  selector: 'app-value-chain',
  templateUrl: './value-chain.component.html',
  styleUrls: ['./value-chain.component.css']
})
export class ValueChainComponent implements OnInit {
  @Input() vc: I_ValueChain  
  valueChainColor: RgbColor
 
  constructor(private cms: ColorMapperService) { }
 
  ngOnInit(): void {
    this.valueChainColor = this.cms.colorOfObject(["value-chain", this.vc.id])
    this.vc.processSteps.forEach(ps => ps.workItems.forEach(wi => wi.rgbColor = this.valueChainColor))
    console.log("ValueChainComponent.onInit vc =")
    console.log(this.vc)
  }

/*  
  ngOnChanges(): void {
    console.log("ValueChainComponent/ngOnChanges vc.id = " +  this.vc.id)
    console.log("ValueChainComponent/ngOnChanges vcIdToCssColorMap = " +  this.cms.vcIdToCssColorMap.size)

  }
*/  
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
