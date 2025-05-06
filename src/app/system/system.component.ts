//-------------------------------------------------------------------
// SYSTEM COMPONENT
//-------------------------------------------------------------------

import { Component, OnChanges, HostListener } from '@angular/core'
import { Observable, catchError, throwError } from "rxjs"
import { BackendApiService } from '../shared/backend-api.service'
import { I_SystemState, I_SystemStatistics, I_ValueChainStatistics, ValueChainId, I_ConfigAsJson, EventTypeId, EventSeverity } from "../shared/io_api_definitions"
import { TimeInterval, ObExtended, PsWorkerUtilization, VcExtended  } from "../shared/frontend_definitions"
import { WorkorderFeederService } from '../shared/workorder-feeder.service'
import { UiBoxSize, UiBoxMarginToWindow, UiSystemHeaderHeight, UiWorkerStatsHeight } from '../shared/ui-boxes-definitions'
import { environment } from '../../environments/environment.prod'
import { ColorMapperService } from '../shared/color-mapper.service'
import { cssColorListVc, cssColorListSest } from '../shared/inventory-layout'
import { ConfigFileService } from '../shared/config-file.service'
import { AppStateService } from '../shared/app-state.service';
import { EventsService } from '../shared/events.service';

/** defines if a new full run can be started or an interrupted run can be resumed */
enum RunResumeButton {
  run    = "Run",
  resume = "Resume"
}

/** maximum of iterations allowed for a run  */
const c_IterationRequestMaxSize = 100

/**
 * @class This Angular component is the central main app to control iteration runs in the Lonely-Lobster backend and display the results.
 */
@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.css']
})
export class SystemComponent implements OnChanges {
  /** observable that delivers the new system state calculated by the backend  */
  systemState$:             Observable<I_SystemState> 
  /** current system state */
  systemState:              I_SystemState
  /** observable that delivers the statistics for the system calculated by the backend */
  systemStatistics$:        Observable<I_SystemStatistics>
  /** latest system statistics */
  systemStatistics:         I_SystemStatistics
  vcsExtended:              VcExtended[] 
  obExtended:               ObExtended
  /** indicator whether the statistics displayed are current or outdated */
  statsAreUpToDate:         boolean  = false
  /** number of time units back into the past from which the system statistics are calculated by the backend; initialized by the backend after having read the system configuration */
  statsInterval:            TimeInterval 
  numValueChains:           number
  /** number of iterations in the current run */
  numIterationsToExecute:   number   // gets initialized by backend  // = 1
  /** number of remaining iterations to go in the current run */
  numIterationsToGo:        number
  /** system configuration object */
  configObject:             I_ConfigAsJson | undefined
  /**  */
  showSystemState:          boolean  = false
  reloadLearnStatsLegend:   boolean  = false
  /** specifies if injection is driven by injection parameters (false) or from work orders file (true) */
  workordersComeFromFile:   boolean  = false
  /** if true then number of iterations per run is 1 */
  iterateOneByOne:          boolean  = true
  optimizeWipLimits:        boolean  = false 
  /** remaining iterations to go after an interrupting stop of a run */
  resumeRemainingIterations:number
  /** initial setting of button is "run" */
  runResumeButton                    = RunResumeButton.run
  /** version of the frontend i.e. this Angular application */
  version                            = environment.version
  
  constructor( private cfs: ConfigFileService,
               private bas: BackendApiService,
               private wof: WorkorderFeederService,
               private ass: AppStateService,
               private cms: ColorMapperService,
               private ess: EventsService ) { 
  }

  /** on initialization of this Angular component intialize system in the backend and notify the application state transition service of this event */
  ngOnInit(): void {
    this.parseAndInititalize()
    this.ass.frontendEventsSubject$.next("system-instantiated")
  }

  ngOnChanges(): void { 
    this.calcSizeOfUiBoxes()
  }

  // ---------------------------------------------------------------------------------------
  // iterating, reseting, stopping
  // ---------------------------------------------------------------------------------------

  /** 
   * after the frontend received a new system state from the backend, update the frontend UI. If there are still iterations to go for the run, initiate the remaining iterations. 
   * If no more iterations to go, fetch the system statistics from the backend.
   * @param systemState - current system state      
   */
  private processIteration(systemState: I_SystemState) {
    this.systemState = systemState 
    this.optimizeWipLimits = systemState.turnWipLimitOptimizationOnInFrontend || (this.optimizeWipLimits && systemState.isWipLimitOptimizationInBackendActive)
    this.calcSizeOfUiBoxes()
    this.updateVcsExtended()
    this.updateObExtended()  

    if (this.systemState.time == 0) {
      return /* just initializing */ 
    }

    if (this.numIterationsToGo > 0) {
      this.iterateNextStates()
    }
    else {
      this.fetchSystemStatistics()
    }
  }

  /**
   * iterate the remaining iterations of a run
   */
  public iterateNextStates(): void {
    this.statsAreUpToDate = false
    const miniBatchSize = this.iterateOneByOne ? 1 
                                               : this.numIterationsToGo > c_IterationRequestMaxSize ? c_IterationRequestMaxSize 
                                                                                                    : this.numIterationsToGo
    this.systemState$ = this.bas.nextSystemStateOnInput(this.wof.iterationRequestsForAllVcs(miniBatchSize, this.optimizeWipLimits, this.workordersComeFromFile))
    this.systemState$.subscribe(systemState => {
      this.numIterationsToGo -= miniBatchSize
      this.processIteration(systemState)
    })
  }

  // ---------------------------------------------------------------------------------------
  // prepare data objects to be passed down to value chains and output basket
  // ---------------------------------------------------------------------------------------

  /**
   * update the extended value-chain data structures that are passed down to the value-chain component objects
   */
  private updateVcsExtended() {
    this.vcsExtended = this.systemState.valueChains
                              .map(vc => { 
                                return {
                                  vc:       vc,
                                  wosUtil:  this.workersUtilOfValueChain(vc.id),
                                  flowStats:this.flowStatsOfValueChain(vc.id)
                                }
                              })
  }

  /**
   * update the extended output basket data structures that is passed down to the output basket component objects
   */
  private updateObExtended() {
    this.obExtended = {
      ob:         this.systemState.outputBasket,
      flowStats:  this.systemStatistics ? this.systemStatistics.outputBasket.flow : undefined
    }
  }

  // ---------------------------------------------------------------------------------------
  // prepare workers shown for each value chain;
  // attach value-chain flow statistics to value chains
  // ---------------------------------------------------------------------------------------

  private workersUtilOfValueChain(vcId: ValueChainId): PsWorkerUtilization[] {
    return this.systemState.workersState.filter(woSt => woSt.assignments.some(vcPs => vcPs.valueChain == vcId))
                                        .map(woSt => { return { worker:                     woSt.worker, 
                                                                utilization:                woSt.utilization,
                                                                assignedProcessSteps:       woSt.assignments.map(vcPs => vcPs.processStep),
                                                                selectionStrategiesWeights: woSt.weightedSelectionStrategies}})
  }

  private flowStatsOfValueChain(vcId: ValueChainId): I_ValueChainStatistics | undefined {
    return this.systemStatistics?.valueChains.find(vcFlowStats => vcFlowStats.id == vcId)
  }

  // ---------------------------------------------------------------------------------------
  // <button> and other handlers
  // ---------------------------------------------------------------------------------------

  /** runs&resume button clicked */
  public runResumeIterationsHandler() {
    this.numIterationsToGo = this.runResumeButton == RunResumeButton.resume ? this.resumeRemainingIterations - 1 : this.numIterationsToExecute 
    this.runResumeButton = RunResumeButton.run
    this.iterateNextStates()
  }
  
  /* stop button clicked */
  public stopIterationsHandler() {
    this.resumeRemainingIterations = Math.max(0, this.numIterationsToGo)
    this.numIterationsToGo = 0
    this.runResumeButton = RunResumeButton.resume
  }

  /** reset button clicked */
  public resetSystemHandler() {
    this.setOrResetSystem()
    this.runResumeButton = RunResumeButton.run
  }

  /** when user changed the interval for which the system statistics are to be shown, re-fetch the statistics for the changed interval */
  public changedStatsIntervalHandler(interval: TimeInterval) {
    this.statsInterval = interval
    this.fetchSystemStatistics()
  }

  // ---------------------------------------------------------------------------------------
  // initialize and reset system;
  // fetch statistics  
  // ---------------------------------------------------------------------------------------
  
  /**
   * read the system configuration from the configuration file service, build the system in the backend, initialize the work order feeder and the color mapper service 
   */
  private parseAndInititalize(): void {
      this.configObject = this.cfs.configAsJson()
      this.setOrResetSystem() // build the system
      this.wof.initialize()   // initialize work order feeder  
      this.cms.clear()  // initialize color mapper ...
      this.cms.addCategory("value-chain",        cssColorListVc)
      this.cms.addCategory("selection-strategy", cssColorListSest)
  }

  /**
   * (re-)build the system in the backend; when system state response received from backend, set UI iteration pre-settings, iterate once, make the statistics color legend reload, add an application event   
   */
  private setOrResetSystem() {
      this.numIterationsToGo = 0
      this.systemState$ = this.bas.systemStateOnInitialization(this.configObject!)
          .pipe(
              catchError((err: any) => {
                this.showSystemState = false
                this.ess.add(EventsService.applicationEventFrom("setOrResetSystem", "(Re)setting system", EventTypeId.systemFailed, EventSeverity.fatal))
                return throwError(() => err)  // re-factor: through uncatched runtime error; how can this be avoided?
            })
      )
      this.systemState$.subscribe(systemState => {
          this.numValueChains = systemState.valueChains.length
          this.applyPresets(systemState)
          this.processIteration(systemState) 
          this.calcSizeOfUiBoxes() 
          this.signalToLearnStatsLegendToReload()
          this.ess.add(EventsService.applicationEventFrom("setOrResetSystem", "(Re)setting system", EventTypeId.systemInOperation, EventSeverity.info))
        })
      this.showSystemState = true
  }
  
  /**
   * fetch the system statistics from the backend
   */
  private fetchSystemStatistics() {
    this.systemStatistics$ = this.bas.currentSystemStatistics(this.statsInterval)
    this.systemStatistics$.subscribe(systemStatistics => {
      this.systemStatistics = systemStatistics
      this.updateVcsExtended()
      this.updateObExtended()
      this.statsAreUpToDate = true
    })
  }

  // ---------------------------------------------------------------------------------------
  // additional UI handling  
  // ---------------------------------------------------------------------------------------
  
  /** set a signal for 1000msecs that the leaning statistics component reloads */
  private signalToLearnStatsLegendToReload(): void {
    this.reloadLearnStatsLegend = true
    setTimeout(() => { 
      this.reloadLearnStatsLegend = false }, 1000)  // ping the child component "LearnStats" that it should reload its color legend  
  }

  /**
   * when rendering the value-chains in the *ngFor loop, help Angular runtime to avoid re-rendering the html element for all value-chains, instead only for value-chains where the id was changed 
   * i.e. a new system with other value-chains was built
   * @param index - unused
   * @param vcExt - value-chain extended data structure
   * @returns value-chain id 
   */
  public identify(index: number, vcExt: VcExtended): ValueChainId {
    return vcExt.vc.id
  } 

  /**
   * set the UI pre-settings from the system state adter initialization of the backend
   * @param systemState - system state from the backend 
   */
  private applyPresets(systemState: I_SystemState): void {
    this.numIterationsToExecute = systemState.frontendPresets.numIterationPerBatch
    this.statsInterval          = systemState.frontendPresets.economicsStatsInterval
  }

  // ---------------------------------------------------------------------------------------
  // auxiliary functions: dealing with work order files as feeding input  
  // ---------------------------------------------------------------------------------------

  /** returns work order file name or undefined if none has been loaded */
  get workordersFileName(): string | undefined {
    return this.wof.workordersFileName 
  }

  /** check if feeding the system with work orders is doable  */
  public workordersToggleHandler() {
    if (this.workordersComeFromFile) {  // change event fires before ngModel has changed the workordersComeFromFile boolean 
      if(!this.wof.workordersFileName) {
        this.ess.add(EventsService.applicationEventFrom("Going to run", this.wof.workordersFileName || "no work order file loaded", EventTypeId.workordersNoFileLoaded, EventSeverity.warning))
        setTimeout(() => { this.workordersComeFromFile = false}, 100) // turn off the toggle for reading from file as it is not possible; does with a small delay as it seems to interfere with ngModel processing the change too
        return
      }
      if (!this.wof.valueChainsHaveMatchingWorkorderFileColumns(this.vcsExtended.map(vce => vce.vc.id))) {
        this.ess.add(EventsService.applicationEventFrom("Going to run", this.wof.workordersFileName, EventTypeId.workordersCsvErrorNotFittingColumns, EventSeverity.warning))
        setTimeout(() => { this.workordersComeFromFile = false}, 100) // turn off the toggle for reading from file as it is not possible; does with a small delay as it seems to interfere with ngModel processing the change too
        return
      }
    }
  }

  // ---------------------------------------------------------------------------------------
  // (re-)sizing of childs' UI boxes  
  // ---------------------------------------------------------------------------------------
  
  /** re-calculate the sizes of the UI boxes when size of browser window was changed by user */
  @HostListener('window:resize', ['$event'])
  onResize(/*event: Event*/) {
    this.calcSizeOfUiBoxes()
  }

  vcsBoxSize: UiBoxSize // all Value Chains
  vcBoxSize:  UiBoxSize // a single Value Chain
  obBoxSize:  UiBoxSize // Output Basket
  
  /** calculate UI boxes' sizes */
  private calcSizeOfUiBoxes(): void {
    this.vcsBoxSize = { 
      width:  Math.round(window.innerWidth / 2 - UiBoxMarginToWindow), 
      height: window.innerHeight - UiSystemHeaderHeight - UiWorkerStatsHeight
    }
    this.vcBoxSize = { 
      width:  this.vcsBoxSize.width, 
      height: Math.round(this.vcsBoxSize.height / this.numValueChains)
    }
    this.obBoxSize = { 
      width:  window.innerWidth - this.vcBoxSize.width - UiBoxMarginToWindow,
      height: this.vcsBoxSize.height
    }
  }
}
