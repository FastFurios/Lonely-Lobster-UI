import { Component, Input, OnInit } from '@angular/core';
import { I_SystemStatistics } from '../shared/io_api_definitions';

type NicelyRounded = string 

interface ObInventoryStatisticsDisplay {
    numWis: number
    netValueAdd: number
    discountedValueAdd: NicelyRounded
    discountedContributionMargin: NicelyRounded
    avgElapsedTime: NicelyRounded
    avgWorkingCapital: NicelyRounded
    roce: string
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

  ngOnInit(): void { }

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
        numWis:                       this.systemStatistics.outputBasket.economics.numWis,
        netValueAdd:                  this.systemStatistics.outputBasket.economics.netValueAdd,
        discountedValueAdd:           nicelyRounded(this.systemStatistics.outputBasket.economics.discountedValueAdd),
        discountedContributionMargin: nicelyRounded(this.systemStatistics.outputBasket.economics.discountedValueAdd - this.systemStatistics.outputBasket.economics.normEffort),
        avgElapsedTime:               nicelyRounded(this.systemStatistics.outputBasket.economics.avgElapsedTime),
        avgWorkingCapital:            nicelyRounded(this.systemStatistics.outputBasket.economics.avgWorkingCapital),
        roce:                         nicelyRounded(this.systemStatistics.outputBasket.economics.roce * 100)
    }
  }


}
