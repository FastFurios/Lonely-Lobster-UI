//-------------------------------------------------------------------
// SYSTEM STATISTICS COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 22.12.2024

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { I_SystemStatistics, Timestamp, TimeInterval } from '../shared/io_api_definitions'

/** display string of a rounded number */
type NicelyRounded = string 

/** statistical value for the system i.e. calculated from the end products in the output basket's inventory */
interface ObInventoryStatisticsDisplay {
    timestamp:                    Timestamp
    numWis:                       number
    netValueAdd:                  number
    discountedValueAdd:           NicelyRounded
    avgContributionMargin:        NicelyRounded
    avgElapsedTime:               NicelyRounded
    avgWorkingCapital:            NicelyRounded
    roceVar:                      NicelyRounded
    roceFix:                      NicelyRounded
} 

/** CSS styles for fresh (= current) and stale (= outdated) values */
const enum TextColors {
  fresh = "color: black",
  stale = "color: grey"
}
/** time interval back into the past for which the statistics are to be calculated; if 0 then since initialization */
const defaultInterval: TimeInterval = 0

/**
 * @class This Angular component renders the system statistics.
 */
@Component({
  selector: 'app-system-stats',
  templateUrl: './system-stats.component.html',
  styleUrls: ['./system-stats.component.css']
})
export class SystemStatsComponent implements OnInit {
  @Input() systemStatistics:       I_SystemStatistics
  @Input() systemTime:             Timestamp
  @Input() statsAreUpToDate:       boolean
  /** the  number of time units back into the past */
  @Input() interval:               TimeInterval               
  /** emit an event to the parent component, i.e. system component, that user changed the statistics interval */
  @Output() intervalEventEmitter = new EventEmitter<TimeInterval>()
  /** nicely rounded statistics numbers for display */
  prettifiedStats:                 ObInventoryStatisticsDisplay
  /** color of the displayed statistics; initialized to stale */
  textColor                      = TextColors.stale
  
  /** @private */
  constructor() { }
  /** @private */
  ngOnInit(): void { }

  /** on change update prettified statistics numbers */ 
  ngOnChanges() {
      this.prettifyStats()
      this.textColor = this.statsAreUpToDate ? TextColors.fresh : TextColors.stale
  }

  /** when user changes the interval let the system component request new system statistics from the backend with the new interval */
  statsIntervalInputHandler(e: Event) {
    this.intervalEventEmitter.emit(this.interval)
  }

  /** prettify the statistics number values nicely to x.yy format */
  public prettifyStats(): void {
      /**
       * rounds a float number to x.yy format 
       * @param n 
       * @returns rounded n in x.xx format
       * @example n = 0.1 => 0.10
       * @example n = 12.15 => 12.15
       * @example n = 3.15678 => 3.16
       */
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
        return left + "." + right.padEnd(2, "0")  
    }

    this.prettifiedStats = 
      this.systemStatistics ? {
        timestamp:                    this.systemStatistics.timestamp,
        numWis:                       this.systemStatistics.outputBasket.economics.numWis,
        netValueAdd:                  this.systemStatistics.outputBasket.economics.netValueAdd,
        discountedValueAdd:           nicelyRounded(this.systemStatistics.outputBasket.economics.discountedValueAdd),
        avgContributionMargin:        nicelyRounded((this.systemStatistics.outputBasket.economics.discountedValueAdd - this.systemStatistics.outputBasket.economics.normEffort) / this.systemStatistics.outputBasket.economics.numWis),
        avgElapsedTime:               nicelyRounded(this.systemStatistics.outputBasket.economics.avgElapsedTime),
        avgWorkingCapital:            nicelyRounded(this.systemStatistics.outputBasket.economics.avgWorkingCapital), 
        roceVar:                      nicelyRounded(this.systemStatistics.outputBasket.economics.roceVar * 100),
        roceFix:                      nicelyRounded(this.systemStatistics.outputBasket.economics.roceFix * 100)
    } :
    {
        timestamp:                    0,
        numWis:                       0,
        netValueAdd:                  0,
        discountedValueAdd:           "0",
        avgContributionMargin:        "0",
        avgElapsedTime:               "0",
        avgWorkingCapital:            "0",
        roceVar:                      "0",
        roceFix:                      "0"
    }
  }


}
