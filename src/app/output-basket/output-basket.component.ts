import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { I_OutputBasket, I_WorkItem } from '../shared/io_api_definitions';
import { ColorMapperService, RgbColor } from '../shared/color-mapper.service'
import { PsInventory, PsInventoryShow, workitemsAsPsInventory } from '../shared/inventory-layout'

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
//    this.ob.workItems.forEach(wi => wi.rgbColor = this.cms.colorOfObject(["value-chain", wi.valueChainId]))
//    this.wis = this.ob.workItems
    this.wis = this.ob.workItems.map(wi => { 
      //console.log("OutputBasketComponent.ngOnInit: wi.id= " + wi.id + " has color: " + this.cms.colorOfObject(["value-chain", wi.valueChainId]))
      return {
      ...wi,
      rgbColor: this.cms.colorOfObject(["value-chain", wi.valueChainId]),
    }})
    for (let wi of this.wis) {
      console.log("OutputBasketComponent.ngOnInit: wi.id = " + wi.id + " is from value-chain: " + wi.valueChainId + " has color: " + this.cms.colorOfObject(["value-chain", wi.valueChainId]))
    }
  }

/*
  ngOnChanges() {   // OnInit sufficient?
    this.wis = this.ob.workItems.map(ep => {
      return {
        id:                 ep.id,
        tag:                ["", ""],  // fix later when I know what to do with the tags
        rgbColor:           this.cms.colorOfObject(["value-chain", ep.valueChainId]),
        valueChainId:       "OutputBasket", //ep.valueChainId, 
        value:              ep.value,
        processStepId:      ep.processStepId,
        accumulatedEffort:  ep.accumulatedEffort,
        elapsedTime:        ep.elapsedTime
      }
    })

  }
*/
}
