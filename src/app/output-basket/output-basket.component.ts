//-------------------------------------------------------------------
// OUTPUT BASKET COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 22.12.2024

import { Component, Input, OnInit, OnChanges } from '@angular/core'
import { I_WorkItem } from '../shared/io_api_definitions'
import { ObExtended } from '../shared/frontend_definitions'
import { ColorMapperService } from '../shared/color-mapper.service'
import { UiBoxSize, UiObHeaderHeight, UiInventoryBoxHeightShrink, UiPsHeaderHeight, UiWorkerNameHeight} from '../shared/ui-boxes-definitions'

/**
 * @class This Angular class displays the system's output basket with its end products.
 */
@Component({
  selector: 'app-output-basket',
  templateUrl: './output-basket.component.html',
  styleUrls: ['./output-basket.component.css']
})
export class OutputBasketComponent implements OnInit, OnChanges {
  @Input() obExtended:  ObExtended
  @Input() obBoxSize:   UiBoxSize
  /** inventory is only shown if true */
  @Input() invVisible:  boolean
  /** work items to be displayed */
  wis:                  I_WorkItem[]

  constructor(private cms: ColorMapperService) { }
  /** @private */
  ngOnInit(): void { }

  /** on changes, e.g. when new work items have arrived in the output basket, add their display color to them */
  ngOnChanges(): void {
    this.wis = this.obExtended.ob.workItems
              .map(wi =>  { 
                            return  { 
                                      ...wi,
                                      rgbColor: this.cms.colorOfObject("value-chain", wi.valueChainId)
                                    }
                          })
    this.calcSizeOfInventoryBox()
  }
 
  // ----- (re-)sizing of childs' UI boxes  -------------
  inventoryBoxSize: UiBoxSize
  uiObHeaderHeight = UiObHeaderHeight

  /** calculate the display area of the output basket's inventory */
  private calcSizeOfInventoryBox(): void {
    this.inventoryBoxSize = { 
      width:  this.obBoxSize.width,
      height: this.obBoxSize.height * UiInventoryBoxHeightShrink - UiPsHeaderHeight - UiWorkerNameHeight
    }
  }
}
