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
  }

  get rgbColorString(): string {
    const displayRgbColor: RgbColor = this.isListOfEndProducts ? this.wi.rgbColor : this.darkenedByEffort()
    return `rgb(${displayRgbColor[0]}, ${displayRgbColor[1]}, ${displayRgbColor[2]})`
  }

  private darkenedByEffort(): RgbColor {
    const darkeningRange: number = Math.min(...this.wi.rgbColor)
    const darkeningStep: number  = this.wi.accumulatedEffort / this.wi.maxEffort * darkeningRange
    return <RgbColor>this.wi.rgbColor.map(ch => Math.round(ch - darkeningStep))
  }

}
