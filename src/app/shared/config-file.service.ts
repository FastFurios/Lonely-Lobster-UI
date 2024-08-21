import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject } from "rxjs"
import { I_ConfigAsJson } from './io_api_definitions'

const sysConfigsPath = "http://localhost:8080/"

export type FrontendPresetParameters = {
  numIterationsPerBatch: number
  economicsStatsIntervall: number
}

export type LearnAndAdaptParms = {
  observationPeriod: number
  successMeasureFunction: number
  adjustmentFactor: number
}

export type WipLimitSearchParms = {
  initialTemperature: number
  degreesPerDownhillStepTolerance: number
  initialJumpDistance: number
  measurementPeriod: number
  wipLimitUpperBoundaryFactor: number
  searchOnAtStart: boolean
  verbose: boolean
}

export type ProcessStep = {
  id: string
  normEffort: number
  wipLimit?: number
}

export type ValueDegradation = {
  function: string
  argument: number
}

export type Injection = {
  throughput: number
  probability: number
}

export type SortVector = {
  measure: string
  selectioCriterion: string
}

export type GloballyDefinedWorkitemSelectionStrategy = {
  id: string
  strategy: SortVector[]
}

export type ValueChain = {
  id: string
  valueAdd: number
  valueDegradation?: ValueDegradation
  injection?: Injection
  processSteps: ProcessStep[]
  workers: Worker[]
}

export type Assignment = {
  vcId: string
  psId: string
}

export type Worker = {
  id: string
  assignments: Assignment[]
  strategies?: string[]
}

export type ConfigAsPojo = {
   id: string
   frontendPresetParameters?: FrontendPresetParameters
   learnAndAdaptParms?: LearnAndAdaptParms
   wipLimitSearchParms?: WipLimitSearchParms
   globallyDefinedWorkitemSelectionStrategies: GloballyDefinedWorkitemSelectionStrategy[]
   valueChains: ValueChain[]
   workers: Worker[]
} | undefined

@Injectable({
  providedIn: 'root'
})
export class ConfigFileService {

  constructor(private http: HttpClient) { }

// ---------------------------------------------------------------------------------------
// set and get system config file in JSON file format  
// ---------------------------------------------------------------------------------------
  
  public filename:         string = ""
  public fileContent:      string
  //private _configAsPojo:   ConfigAsPojo
  private _configAsJson:   I_ConfigAsJson
  private componentEventSubject          = new BehaviorSubject<string>("")
  public  componentEventSubject$         = this.componentEventSubject.asObservable()

 /* 
  set configAsJson(configPojo: ConfigAsPojo) {
    this._configAsPojo = configPojo 
//    console.log(`config-file.service: set objFromJsonFile(): this._objFromJsonFile=`)
//    console.log(this._configObject)
  }
*/
  set configAsJson(configJson: I_ConfigAsJson) {
    // console.log(`cfs.configAsJson(configJson) with configJson =`)
    // console.log(configJson)
    this._configAsJson = configJson 
  }

  /*
  get configAsJson(): ConfigAsPojo | undefined {
    return this._configAsPojo
  }
  */

  get configAsJson(): I_ConfigAsJson {
    return this._configAsJson
  }

  set componentEvent(compEvent: string) {
    //console.log(`cfs.component(${compEvent}): triggering component event`)
    this.componentEventSubject.next(compEvent)
  }

}
