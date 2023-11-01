import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { I_SystemStatistics, Timestamp, TimeUnit } from '../shared/io_api_definitions'

type NicelyRounded = string 

interface ObInventoryStatisticsDisplay {
    timestamp:                    Timestamp
    numWis:                       number
    netValueAdd:                  number
    discountedValueAdd:           NicelyRounded
    discountedContributionMargin: NicelyRounded
    avgElapsedTime:               NicelyRounded
    avgWorkingCapital:            NicelyRounded
    roce:                         NicelyRounded
} 

const enum TextColors {
  fresh = "color: black",
  stale = "color: grey"
}
const defaultInterval: TimeUnit = 0  // 0 = Interval begins at time = 0; >0 = trailing time window size  

@Component({
  selector: 'app-system-stats',
  templateUrl: './system-stats.component.html',
  styleUrls: ['./system-stats.component.css']
})
export class SystemStatsComponent implements OnInit {
  @Input() systemStatistics:       I_SystemStatistics
  @Input() systemTime:             Timestamp
  @Input() statsAreUpToDate:       boolean
  @Input() interval:               TimeUnit               
  @Output() intervalEventEmitter = new EventEmitter<TimeUnit>()
  prettifiedStats:                 ObInventoryStatisticsDisplay
  textColor                      = TextColors.stale
  
  constructor() { }

  ngOnInit(): void { }

  ngOnChanges() {
      this.prettifyStats()
      this.textColor = this.statsAreUpToDate ? TextColors.fresh : TextColors.stale
  }

  statsIntervalInputHandler(e: Event) {
    this.intervalEventEmitter.emit(this.interval)
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

    this.prettifiedStats = 
      !this.systemStatistics ? 
        {
          timestamp:                    0,
          numWis:                       0,
          netValueAdd:                  0,
          discountedValueAdd:           "0",
          discountedContributionMargin: "0",
          avgElapsedTime:               "0",
          avgWorkingCapital:            "0",
          roce:                         "0"
        }
        : {
          timestamp:                    this.systemStatistics.timestamp,
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
