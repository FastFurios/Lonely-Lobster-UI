import { Component, OnInit, Input } from '@angular/core'
import { PsInventoryWi } from '../shared/inventory-layout'
import { RgbColor } from '../shared/color-mapper.service'


@Component({
  selector: 'app-inventory-workitem',
  templateUrl: './inventory-workitem.component.html',
  styleUrls: ['./inventory-workitem.component.css']
})
export class InventoryWorkitemComponent implements OnInit {
  @Input() wi: PsInventoryWi
  @Input() isListOfEndProducts: boolean

  constructor() { }

  ngOnInit(): void { 
//  console.log("InventoryWorkitemComponent.ngOnInit() wi.id/.vc/.value=" + this.wi.id + "," + this.wi.valueChainId + "," + this.wi.valueOfValueChain)
//  console.log("InventoryWorkitemComponent.ngOnInit() wi.rgbColor defined? = " + this.wi.rgbColor != undefined)
//  console.log("InventoryWorkitemComponent.ngOnInit() wi.rgbColor=" + this.wi.rgbColor[0] + "," + this.wi.rgbColor[1] + "," + this.wi.rgbColor[2])
  }

  get rgbColorString(): string {
    const displayRgbColor: RgbColor = this.isListOfEndProducts ? this.wi.rgbColor : this.darkenedByEffort()
//  console.log("InventoryWorkitemComponent.rgbColorString() displayRgbColor=" + displayRgbColor[0] + "," + displayRgbColor[1] + "," + displayRgbColor[2])
    return `rgb(${displayRgbColor[0]}, ${displayRgbColor[1]}, ${displayRgbColor[2]})`
  }

  private darkenedByEffort(): RgbColor {
//  console.log("InventoryWorkitemComponent.darkenedByEffort: this.wi is defined? " + (this.wi != undefined))
//  console.log("InventoryWorkitemComponent.darkenedByEffort: this.wi.rgbColor is defined? " + (this.wi.rgbColor != undefined))
    const darkeningRange: number = Math.min(...this.wi.rgbColor)
    const darkeningStep: number  = this.wi.accumulatedEffort / this.wi.maxEffort * darkeningRange
//  console.log("inventoryWorkitem= " + this.wi.id + ", darkenedByEffort(): wi.accumulatedEffort= " + this.wi.accumulatedEffort + ", darkeningStep= " + darkeningStep)
    return <RgbColor>this.wi.rgbColor.map(ch => Math.round(ch - darkeningStep))
  }

}
