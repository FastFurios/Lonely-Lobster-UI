import { Component, Input, OnInit, OnChanges } from '@angular/core'
import { I_OutputBasket, I_WorkItem, ObExtended } from '../shared/io_api_definitions'
import { ColorMapperService } from '../shared/color-mapper.service'
import { UiBoxSize, UiObHeaderHeight, UiInventoryBoxHeightShrink, UiPsHeaderHeight, UiWorkerNameHeight} from '../shared/ui-boxes-definitions'

@Component({
  selector: 'app-output-basket',
  templateUrl: './output-basket.component.html',
  styleUrls: ['./output-basket.component.css']
})
export class OutputBasketComponent implements OnInit, OnChanges {
  @Input() ob:          I_OutputBasket // tbd
  @Input() obExtended:  ObExtended
  @Input() obBoxSize:   UiBoxSize
  wis:                  I_WorkItem[]

  constructor(private cms: ColorMapperService) { }

  ngOnInit(): void { }

  ngOnChanges(): void {
    this.wis = this.obExtended.ob.workItems
              .map(wi =>  { 
                            return  { 
                                      ...wi,
                                      rgbColor: this.cms.colorOfObject("valuechain", wi.valueChainId)
                                    }
                          })
    this.calcSizeOfInventoryBox()
  }
 
  // ----- (re-)sizing of childs' UI boxes  -------------
  inventoryBoxSize: UiBoxSize
  uiObHeaderHeight = UiObHeaderHeight

  private calcSizeOfInventoryBox(): void {
    this.inventoryBoxSize = { 
      width:  this.obBoxSize.width,
      height: this.obBoxSize.height * UiInventoryBoxHeightShrink - UiPsHeaderHeight - UiWorkerNameHeight
    }
  }
}
