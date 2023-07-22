import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { I_OutputBasket, I_WorkItem, ObExtended } from '../shared/io_api_definitions';
import { ColorMapperService } from '../shared/color-mapper.service'
import { UiBoxSize, UiObHeaderHeight} from '../shared/ui-boxes-definitions';



@Component({
  selector: 'app-output-basket',
  templateUrl: './output-basket.component.html',
  styleUrls: ['./output-basket.component.css']
})
export class OutputBasketComponent implements OnInit, OnChanges {
  @Input() ob: I_OutputBasket // tbd
  @Input() obExtended: ObExtended
  @Input() obBoxSize: UiBoxSize
  wis: I_WorkItem[]
//psInventory: PsInventory
//psInventoryShow: PsInventoryShow

  constructor(private cms: ColorMapperService) { }

  ngOnInit(): void {
    //console.log("OutputBasketComponent.ngOnInit")

    //console.log("OutputBasketComponent.ngOnInit obBoxSize w/h=" + this.obBoxSize.width + " / " + this.obBoxSize.height)
/*    this.wis = this.ob.workItems
              .map(wi =>  { 
                            return  { 
                                      ...wi,
                                      rgbColor: this.cms.colorOfObject(["value-chain", wi.valueChainId])
                                    }
                          })

                        */  
    }

  ngOnChanges(): void {
    //console.log("OutputBasketComponent.ngOnChanges")
    this.wis = this.obExtended.ob.workItems
              .map(wi =>  { 
                            return  { 
                                      ...wi,
                                      rgbColor: this.cms.colorOfObject(["value-chain", wi.valueChainId])
                                    }
                          })
    this.calcSizeOfInventoryBox()
  }
 
  // ----- (re-)sizing of childs' UI boxes  -------------
  inventoryBoxSize:          UiBoxSize // = { width: 0, height: 0 }
  uiObHeaderHeight = UiObHeaderHeight

  private calcSizeOfInventoryBox(): void {
    this.inventoryBoxSize = { 
      width:  this.obBoxSize.width,
      height: this.obBoxSize.height - UiObHeaderHeight
    }
    //console.log("OutputBasketComponent.calcSizeOfProcessStepBox(): inventoryBox Size h=" + this.inventoryBoxSize.height)
  }
}
