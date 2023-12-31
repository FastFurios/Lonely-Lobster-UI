import { Component, Input, OnInit } from '@angular/core';
import { Observable } from "rxjs"
import { BackendApiService } from '../shared/backend-api.service'
import { I_LearningStatsWorkers, I_WeightedSelectionStrategy, Timestamp, WorkerName } from '../shared/io_api_definitions'
import { rgbColorToCssString } from '../shared/inventory-layout'
import { ColorMapperService } from '../shared/color-mapper.service';

type ColoredWeightedSelectionStrategy = I_WeightedSelectionStrategy & {
  backgroundColor: string // string with css color codes 
}

type ColoredWeightedSelectionStrategiesAtTimestamp = {
  timestamp:                                  Timestamp,
  coloredSelectionStrategiesNamesWithWeights: ColoredWeightedSelectionStrategy[]
}

export type ColoredLearningStatsWorker = { 
  worker: WorkerName,
  series: ColoredWeightedSelectionStrategiesAtTimestamp[]
}

export type ColoredLearningStatsWorkers = ColoredLearningStatsWorker[]

@Component({
  selector: 'app-learn-stats',
  templateUrl: './learn-stats.component.html',
  styleUrls: ['./learn-stats.component.css']
})
export class LearnStatsComponent implements OnInit {
  @Input() reloadLearnStatsLegend:  boolean
  learnStatsWorkers$:               Observable<I_LearningStatsWorkers>
  learnStatsWorkers:                I_LearningStatsWorkers
  coloredLearnStatsWorkers:         ColoredLearningStatsWorkers
  statsStaleNotification:           string


  constructor(private bas: BackendApiService,
              private cms: ColorMapperService) {}

  ngOnInit(): void { }

  public updateLearnStatsHandler(): void {
    console.log("LearnStats.updateLearnStatsHandler()")
    this.learnStatsWorkers$ = this.bas.learningStatistics()
    this.learnStatsWorkers$.subscribe(learnStatsWorkers => {
      this.learnStatsWorkers = learnStatsWorkers
      this.learnStatsWorkers = this.learnStatsWorkers.sort((a, b) => a.worker < b.worker ? -1 : 1)  //sort workers by name asc
      this.colorLearnStatsWorkers()
    })
  }

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

