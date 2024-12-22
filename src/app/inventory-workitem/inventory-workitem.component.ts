//-------------------------------------------------------------------
// INVENTORY WORK ITEM COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 22.12.2024

import { Component, OnInit, Input } from '@angular/core'
import { PsInventoryWi } from '../shared/inventory-layout'
import { RgbColor } from '../shared/color-mapper.service'

/**
 * @class This Angular component renders a single work item of the inventory.
 */
@Component({
  selector: 'app-inventory-workitem',
  templateUrl: './inventory-workitem.component.html',
  styleUrls: ['./inventory-workitem.component.css']
})
export class InventoryWorkitemComponent implements OnInit {
  /** all data of a work item in the inventory */
  @Input() wi: PsInventoryWi
  /** true if work item in the output basket */
  @Input() isListOfEndProducts: boolean

  /** @private */
  constructor() { }
  /** @private */
  ngOnInit(): void { }

  /** CSS color of the work item */
  get rgbColorString(): string {
    const displayRgbColor: RgbColor = this.isListOfEndProducts ? this.wi.rgbColor : this.darkenedByEffort()
    return `rgb(${displayRgbColor[0]}, ${displayRgbColor[1]}, ${displayRgbColor[2]})`
  }

  /** CSS color darkened by the effort that has gone into the work item in the current process step */
  private darkenedByEffort(): RgbColor {
    const darkeningRange: number = Math.min(...this.wi.rgbColor)
    const darkeningStep:  number = this.wi.maxEffort > 0 ? this.wi.accumulatedEffort / this.wi.maxEffort * darkeningRange : 0
    return <RgbColor>this.wi.rgbColor.map(ch => Math.round(ch - darkeningStep))
  }
}
