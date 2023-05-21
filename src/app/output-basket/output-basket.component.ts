import { Component, Input, OnInit } from '@angular/core';
import { I_OutputBasket, I_WorkItem } from '../shared/io_api_definitions';
import { ColorMapperService } from '../shared/color-mapper.service'
import { PsInventory, PsInventoryShow } from '../shared/inventory-layout'

@Component({
  selector: 'app-output-basket',
  templateUrl: './output-basket.component.html',
  styleUrls: ['./output-basket.component.css']
})
export class OutputBasketComponent implements OnInit {
  @Input() ob: I_OutputBasket
  wis: I_WorkItem[]
  psInventory: PsInventory
  psInventoryShow: PsInventoryShow

  constructor(private cms: ColorMapperService) { }

  ngOnInit(): void {
    this.wis = this.ob.workItems.map(wi => { 
      return {
      ...wi,
      rgbColor: this.cms.colorOfObject(["value-chain", wi.valueChainId]),
    }})
  }

}
