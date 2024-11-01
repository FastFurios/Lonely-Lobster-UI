import { Component, OnChanges, HostListener } from '@angular/core'
import { Observable, catchError, throwError } from "rxjs"
import { BackendApiService } from '../shared/backend-api.service'
import { TimeUnit, I_SystemState, I_SystemStatistics, I_ValueChainStatistics, ObExtended, PsWorkerUtilization, ValueChainId, VcExtended, I_ConfigAsJson } from "../shared/io_api_definitions"
import { WorkorderFeederService } from '../shared/workorder-feeder.service'
import { UiBoxSize, UiBoxMarginToWindow, UiSystemHeaderHeight, UiWorkerStatsHeight } from '../shared/ui-boxes-definitions'
import { environment } from '../../environments/environment.prod'
import { ColorMapperService } from '../shared/color-mapper.service'
import { cssColorListVc, cssColorListSest } from '../shared/inventory-layout'
import { ConfigFileService } from '../shared/config-file.service'
import { AppStateService, FrontendState } from '../shared/app-state.service';
import { ApplicableRefactorInfo } from 'typescript'

enum RunResumeButton {
  run    = "Run",
  resume = "Resume"
}

const c_IterationRequestMaxSize = 100

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.css']
})
export class SystemComponent implements OnChanges {
  systemState$:             Observable<I_SystemState> 
  systemState:              I_SystemState
  systemStatistics$:        Observable<I_SystemStatistics>
  systemStatistics:         I_SystemStatistics
  vcsExtended:              VcExtended[] 
  obExtended:               ObExtended
  statsAreUpToDate:         boolean  = false
  statsInterval:            TimeUnit // gets initialized by backend  //= 0 // from t=1 to now 
  numValueChains:           number
  numIterationsToExecute:   number   // gets initialized by backend  // = 1
  numIterationsToGo:        number
  backendErrorMessage:      string   = ""
  filename:                 string = ""
  //systemId:         string = "- empty -"
  configObject:             I_ConfigAsJson 
  showSystemState:          boolean  = false
  reloadLearnStatsLegend:   boolean  = false
  invVisible:               boolean  = true
  iterateOneByOne:          boolean  = true
  optimizeWipLimits:        boolean  = false 
  resumeRemainingIterations:number
  runResumeButton                    = RunResumeButton.run

  version                            = environment.version
  
  constructor( private cfs: ConfigFileService,
               private bas: BackendApiService,
               private wof: WorkorderFeederService,
               private ats: AppStateService,
               private cms: ColorMapperService ) { 
  }

  ngOnInit(): void {
    this.parseAndInititalize()
    this.ats.frontendEventsSubject$.next("system-instantiated")
    console.log("System.ngOnInit()")
  }

  ngOnChanges(): void {
    this.calcSizeOfUiBoxes()
  }

  // ---------------------------------------------------------------------------------------
  // iterating, reseting, stopping
  // ---------------------------------------------------------------------------------------

  private processIteration(systemState: I_SystemState) {
    this.systemState = systemState 
    //console.log("systemState.isWipLimitOptimizationInBackendActive=" + systemState.isWipLimitOptimizationInBackendActive)
    //console.log("this.optimizeWipLimits=" + this.optimizeWipLimits)
    //console.log("systemState.turnWipLimitOptimizationOnInFrontend=" + systemState.turnWipLimitOptimizationOnInFrontend)
    //console.log(systemState)
    this.optimizeWipLimits = systemState.turnWipLimitOptimizationOnInFrontend || (this.optimizeWipLimits && systemState.isWipLimitOptimizationInBackendActive)
    this.calcSizeOfUiBoxes()
    this.updateVcsExtended()
    this.updateObExtended()  

    if (this.systemState.time == 0) {
      return /* just initializing */ 
    }

//  this.numIterationsToGo--
    if (this.numIterationsToGo > 0)
      this.iterateNextStates()
    else {
      this.fetchSystemStatistics()
    }
  }

  public iterateNextStates(): void {
    this.statsAreUpToDate = false
    const miniBatchSize = this.iterateOneByOne ? 1 
                                               : this.numIterationsToGo > c_IterationRequestMaxSize ? c_IterationRequestMaxSize 
                                                                                                    : this.numIterationsToGo
    this.systemState$ = this.bas.nextSystemStateOnInput(this.wof.iterationRequestsForAllVcs(miniBatchSize, this.optimizeWipLimits))
    this.systemState$.subscribe(systemState => {
      this.numIterationsToGo -= miniBatchSize
      this.processIteration(systemState)
    })
  }

  // ---------------------------------------------------------------------------------------
  // prepare data objects to be passed down to value chains and output basket
  // ---------------------------------------------------------------------------------------

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

  public runResumeIterationsHandler() {
    this.numIterationsToGo = this.runResumeButton == RunResumeButton.resume ? this.resumeRemainingIterations - 1 : this.numIterationsToExecute 
    this.runResumeButton = RunResumeButton.run
    //this.learnStatsUptodate = false
    this.iterateNextStates()
  }
  
  public stopIterationsHandler() {
    this.resumeRemainingIterations = Math.max(0, this.numIterationsToGo)
    this.numIterationsToGo = 0
    this.runResumeButton = RunResumeButton.resume
  }

  public resetSystemHandler() {
    this.setOrResetSystem()
    this.runResumeButton = RunResumeButton.run
  }

  public fetchStatisticsHandler() {
    this.fetchSystemStatistics()
  }

  public changedStatsIntervalHandler(interval: TimeUnit) {
    this.statsInterval = interval
    this.fetchSystemStatistics()
  }

  // ---------------------------------------------------------------------------------------
  // read and write system config file  
  // ---------------------------------------------------------------------------------------
  /**
  public onFileSelected(e: any) { 
    const file: File = e.target.files[0] 
    this.filename = file.name
    const obs$ = this.readFileContentObs(file)
    obs$.subscribe((fileContent: string) => this.parseAndInititalize(fileContent))
  }

  private readFileContentObs(file: File): Observable<string> {
    return new Observable((subscriber) => {
      if (!file) subscriber.error("no file selected")
      if (file.size == 0) subscriber.error("selected file is empty")

      const reader = new FileReader()
      reader.onload = (e) => {
        if (!reader.result) subscriber.error("no result from reading")
        else subscriber.next(reader.result.toString())
      }
      reader.onerror = (error) => {
        subscriber.error(error);
      }
      reader.readAsText(file)
    })
  }

  public onSaveFile(): void {
//  let fileContent = "Hi there, I was just saved from the Angular app!"
    let fileContent = {
      name: "Gerold",
      age: 56
    }
    const file = new Blob([JSON.stringify(fileContent)], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(file)
    link.download = this.filename
    console.log("system.onSaveFile(): saving to " + link.download)
    link.click()
    link.remove()
  }
  */
  // ---------------------------------------------------------------------------------------
  // initialize and reset system;
  // fetch statistics  
  // ---------------------------------------------------------------------------------------
  
  private parseAndInititalize(): void {
      this.configObject = this.cfs.configAsJson // JSON.parse(fileContent) 
      //this.systemId = this.objFromJsonFile.system_id
      this.setOrResetSystem() // build the system
      this.wof.initialize()   // initialize work order feeder  
      this.cms.clear()  // initialize color mapper ...
      this.cms.addCategory("value-chain",        cssColorListVc)
      this.cms.addCategory("selection-strategy", cssColorListSest) 
//    this.onSaveFile()  // ######################## tbd ###############

  }

  private setOrResetSystem() {
      this.numIterationsToGo = 0
//    this.wof.initialize()
      this.systemState$ = this.bas.systemStateOnInitialization(this.configObject).pipe(
        catchError((err: any) => {
          this.backendErrorMessage = "*** ERROR: could not reach backend or error in the backend"
          this.showSystemState = false
          return throwError(() => new Error("*** ERROR: " + err.error.message))
        })
      )
      this.systemState$.subscribe(systemState => {
        this.numValueChains = systemState.valueChains.length
        //console.log("system.setOrResetSystem(): systemState.frontendPresets=")
        //console.log(systemState.frontendPresets)
        this.applyPresets(systemState)
        this.processIteration(systemState) 
        this.calcSizeOfUiBoxes() 
        this.backendErrorMessage = ""
        this.signalLearnStatsLegendToReload()
      })
      this.showSystemState = true
  }
  
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
  
  private signalLearnStatsLegendToReload(): void {
    this.reloadLearnStatsLegend = true
    setTimeout(() => { 
      this.reloadLearnStatsLegend = false }, 1000)  // ping the child component "LearnStats" that it should reload its color legend  
  }

  public identify(index: number, vcExt: VcExtended): ValueChainId { // https://stackoverflow.com/questions/42108217/how-to-use-trackby-with-ngfor // https://upmostly.com/angular/using-trackby-with-ngfor-loops-in-angular // https://angular.io/api/common/NgFor
    //console.log("System: identify() returning vcExt.vc.id = " + vcExt.vc.id )
    return vcExt.vc.id
  } 

  private applyPresets(systemState: I_SystemState): void {
    this.numIterationsToExecute = systemState.frontendPresets.numIterationPerBatch
    this.statsInterval          = systemState.frontendPresets.economicsStatsInterval
  }

  // ---------------------------------------------------------------------------------------
  // (re-)sizing of childs' UI boxes  
  // ---------------------------------------------------------------------------------------
  
  @HostListener('window:resize', ['$event'])
  onResize(/*event: Event*/) {
    this.calcSizeOfUiBoxes()
  }

  vcsBoxSize: UiBoxSize // all Value Chains
  vcBoxSize:  UiBoxSize // a single Value Chain
  obBoxSize:  UiBoxSize // Output Basket
  
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
