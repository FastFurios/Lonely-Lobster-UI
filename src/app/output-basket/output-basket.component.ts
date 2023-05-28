import { Component, Input, OnInit } from '@angular/core';
import { I_OutputBasket, I_WorkItem } from '../shared/io_api_definitions';
import { ColorMapperService } from '../shared/color-mapper.service'
import { PsInventory, PsInventoryShow } from '../shared/inventory-layout'

type UiBoxSize = {
  width:  number
  height: number
}
@Component({
  selector: 'app-output-basket',
  templateUrl: './output-basket.component.html',
  styleUrls: ['./output-basket.component.css']
})
export class OutputBasketComponent implements OnInit {
  @Input() ob: I_OutputBasket
  @Input() obBoxSize: UiBoxSize
  wis: I_WorkItem[]
//psInventory: PsInventory
//psInventoryShow: PsInventoryShow

  constructor(private cms: ColorMapperService) { }

  ngOnInit(): void {
    console.log("OutputBasketComponent.ngOnInit obBoxSize w/h=" + this.obBoxSize.width + " / " + this.obBoxSize.height)
    this.wis = this.ob.workItems
              .map(wi =>  { 
                            return  { 
                                      ...wi,
                                      rgbColor: this.cms.colorOfObject(["value-chain", wi.valueChainId])
                                    }
                          })

  }
}
