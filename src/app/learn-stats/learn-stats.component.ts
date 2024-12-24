//-------------------------------------------------------------------
// LEARN STATISTICS COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 22.12.2024

import { Component, Input, OnInit } from '@angular/core'
import { Observable } from "rxjs"
import { BackendApiService } from '../shared/backend-api.service'
import { I_LearningStatsWorkers, Timestamp, WorkerName } from '../shared/io_api_definitions'
import { ColoredWeightedSelectionStrategy } from '../shared/frontend_definitions'
import { rgbColorToCssString } from '../shared/inventory-layout'
import { ColorMapperService } from '../shared/color-mapper.service';

/** weighted strategy with its display color at a timestamp */
type ColoredWeightedSelectionStrategiesAtTimestamp = {
  timestamp:                                  Timestamp,
  coloredSelectionStrategiesNamesWithWeights: ColoredWeightedSelectionStrategy[]
}

/** learning statistics of a worker showing the strategies' weights over time */
export type ColoredLearningStatsWorker = { 
  worker: WorkerName,
  series: ColoredWeightedSelectionStrategiesAtTimestamp[]
}

/** learning statistics of all workers showing their strategies' weights over time */
export type ColoredLearningStatsWorkers = ColoredLearningStatsWorker[]

/**
 * @class This Angular class renders the statistics of the workers trying to find the best mix of using their available work item selection strategies over time. 
 */
@Component({
  selector: 'app-learn-stats',
  templateUrl: './learn-stats.component.html',
  styleUrls: ['./learn-stats.component.css']
})
export class LearnStatsComponent implements OnInit {
  /** indicator to reload the learning statistics */
  @Input() reloadLearnStatsLegend:  boolean
  /** observable to read learning statistics from the Lonely-Lobster backend */
  learnStatsWorkers$:               Observable<I_LearningStatsWorkers>
  /** learning statistics from the backend */
  learnStatsWorkers:                I_LearningStatsWorkers
  /** Workers' statistics colored for display */
  coloredLearnStatsWorkers:         ColoredLearningStatsWorkers

  constructor(private bas: BackendApiService,
              private cms: ColorMapperService) {}
  /** @private */
  ngOnInit(): void { }

  /** read latest statistics from backend and prepare them for rendering */
  public updateLearnStatsHandler(): void {
    this.learnStatsWorkers$ = this.bas.learningStatistics()
    this.learnStatsWorkers$.subscribe(learnStatsWorkers => {
      this.learnStatsWorkers = learnStatsWorkers
      this.learnStatsWorkers = this.learnStatsWorkers.sort((a, b) => a.worker < b.worker ? -1 : 1)  //sort workers by name asc
      this.colorLearnStatsWorkers()
    })
  }

  /** color the bars in the workers' learning statistics */
  private colorLearnStatsWorkers(): void {
    this.coloredLearnStatsWorkers = this.learnStatsWorkers.map(wo => { 
      return {
        worker: wo.worker,
        series: wo.series.map(wSestsTs => {
          return { 
            timestamp: wSestsTs.timestamp,
            coloredSelectionStrategiesNamesWithWeights: wSestsTs.selectionStrategyNamesWithWeights.map(wSest => {
              return {
                ...wSest,
                backgroundColor: rgbColorToCssString(this.cms.colorOfObject("selection-strategy", wSest.id)!)
              }
            })
          }
        })
      }
    })
  }
}

