import { Component, OnInit, Input } from '@angular/core'
import { PsInventoryWi } from '../shared/inventory-layout'
import { RgbColor } from '../shared/color-mapper.service'


type Color = { red: number; green: number; blue: number }

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
    console.log("InventoryWorkitemComponent.onInit: wi = ")
    console.log(this.wi)
  }

  get rgbColorString(): string {
//    console.log(this.wi.id + ": rgb=" + this.wi.rgbColor[0] + "/" + this.wi.rgbColor[1] + "/" + this.wi.rgbColor[2])
    //console.log(`InventoryWorkitemComponent.rgbColorString() = rgb(${this.wi.rgbColor[0]}, ${this.wi.rgbColor[1]}, ${this.wi.rgbColor[2]})`)
    const displayRgbColor: RgbColor = this.isListOfEndProducts ? this.wi.rgbColor : this.darkenedByEffort()
    return `rgb(${displayRgbColor[0]}, ${displayRgbColor[1]}, ${displayRgbColor[2]})`
  }

  private darkenedByEffort(): RgbColor {
    const darkeningRange: number = Math.min(...this.wi.rgbColor)
    const darkeningStep: number  = this.wi.accumulatedEffort / this.wi.maxEffort * darkeningRange
    console.log(`InventoryWorkitemComponent.darkenedByEffort: wi=${this.wi.id} darkeningStep = ${darkeningStep}` )

    console.log(`InventoryWorkitemComponent.darkenedByEffort: wi=${this.wi.id} rgb-in = rgb(${this.wi.rgbColor[0]}, ${this.wi.rgbColor[1]}, ${this.wi.rgbColor[2]})` )
    const darkenedRgbColor = <RgbColor>this.wi.rgbColor.map(ch => Math.round(ch - darkeningStep))
    console.log(`InventoryWorkitemComponent.darkenedByEffort: wi=${this.wi.id} rgb-out= rgb(${darkenedRgbColor[0]}, ${darkenedRgbColor[1]}, ${darkenedRgbColor[2]})` )
    return darkenedRgbColor
  }

}
