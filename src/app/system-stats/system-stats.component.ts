import { Component, Input, OnInit } from '@angular/core';
import { I_InventoryStatistics, I_SystemStatistics } from '../shared/io_api_definitions';

type NicelyRounded = string 

interface ObInventoryStatisticsDisplay {
    numWis: number
    workingCapital: number
    avgElapsedTime: string
    netValueAdd: number
    discountedValueAdd: NicelyRounded
    discountedContributionMargin: NicelyRounded
    roci: string
} 

@Component({
  selector: 'app-system-stats',
  templateUrl: './system-stats.component.html',
  styleUrls: ['./system-stats.component.css']
})
export class SystemStatsComponent implements OnInit {
  @Input() systemStatistics: I_SystemStatistics
  prettifiedStats: ObInventoryStatisticsDisplay


  constructor() { }

  ngOnInit(): void {
  }


  ngOnChanges() {
      if (this.systemStatistics) this.prettifyStats()
  }

  public prettifyStats(): void {
      function nicelyRounded(n: number): NicelyRounded {
        const roundedTo2decs = (Math.round(n * 100) / 100).toString()
        const indexOfDecPoint = roundedTo2decs.indexOf(".")
    
        let left:  string
        let right: string
        if (indexOfDecPoint < 0) { // no decimal point
            left  = roundedTo2decs
            right = "00"
        }
        else {
            left  = roundedTo2decs.split(".")[0]
            right = roundedTo2decs.split(".")[1]
        }
        return left + "." + right.padEnd(2 - right.length, "0")  
    }
    this.prettifiedStats = {
        numWis:                       this.systemStatistics.outputBasket.inventory.numWis,
        workingCapital:               this.systemStatistics.outputBasket.inventory.normEffort,
        avgElapsedTime:               nicelyRounded(this.systemStatistics.outputBasket.inventory.avgElapsedTime),
        netValueAdd:                  this.systemStatistics.outputBasket.inventory.netValueAdd,
        discountedValueAdd:           nicelyRounded(this.systemStatistics.outputBasket.inventory.discountedValueAdd),
        discountedContributionMargin: nicelyRounded(this.systemStatistics.outputBasket.inventory.discountedValueAdd - this.systemStatistics.outputBasket.inventory.normEffort),
        roci:                         nicelyRounded(this.systemStatistics.outputBasket.inventory.roci * 100) + "%"
    }
  }


}
