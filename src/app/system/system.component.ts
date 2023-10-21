import { Component, OnInit, OnChanges, HostListener } from '@angular/core'
import { Observable, catchError, throwError } from "rxjs"
import { BackendApiService } from '../shared/backend-api.service'
import { TimeUnit, I_SystemState, I_SystemStatistics, I_ValueChainStatistics, ObExtended, PsWorkerUtilization, ValueChainId, VcExtended } from "../shared/io_api_definitions"
import { WorkorderFeederService } from '../shared/workorder-feeder.service'
import { UiBoxSize, UiBoxMarginToWindow, UiSystemHeaderHeight, UiWorkerStatsHeight } from '../shared/ui-boxes-definitions'
import { environment } from '../../environments/environment.prod'

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.css']
})
export class SystemComponent implements OnInit, OnChanges {
  systemState$:           Observable<I_SystemState> 
  systemState:            I_SystemState
  systemStatistics$:      Observable<I_SystemStatistics>
  systemStatistics:       I_SystemStatistics
  vcsExtended:            VcExtended[] 
  obExtended:             ObExtended
  statsAreUpToDate:       boolean  = false
  statsInterval:          TimeUnit = 10 
  numValueChains:         number
  numIterationsToExecute: number   = 1
  numIterationsToGo:      number
  backendErrorMessage:    string   = ""
  showSystemState:        boolean  = false
  version                          = environment.version
  
  constructor( private bas: BackendApiService,
               private wof: WorkorderFeederService ) { }

  ngOnInit(): void {
    this.calcSizeOfUiBoxes()
  }
 
  ngOnChanges(): void {
    this.calcSizeOfUiBoxes()
  }

  // ---------------------------------------------------------------------------------------
  // iterating, reseting, stopping
  // ---------------------------------------------------------------------------------------

  private processIteration(systemState: I_SystemState) {
    this.systemState = systemState 
    this.calcSizeOfUiBoxes()
    this.updateVcsExtended()
    this.updateObExtended()  

    if (this.systemState.time == 0) {
      return /* just initializing */ 
    }
    this.numIterationsToGo--
    if (this.numIterationsToGo > 0)
      this.iterateNextStates()
    else {
      this.fetchSystemStatistics()
    }
  }

  public iterateNextStates(): void {
    this.systemState$ = this.bas.nextSystemStateOnInput(this.wof.iterationRequestForAllVcs())
    this.systemState$.subscribe(systemState => this.processIteration(systemState))
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
                                        .map(woSt => { return { worker:               woSt.worker, 
                                                                utilization:          woSt.utilization,
                                                                assignedProcessSteps: woSt.assignments.map(vcPs => vcPs.processStep)}})
  }

  private flowStatsOfValueChain(vcId: ValueChainId): I_ValueChainStatistics | undefined {
    return this.systemStatistics?.valueChains.find(vcFlowStats => vcFlowStats.id == vcId)
  }

  // ---------------------------------------------------------------------------------------
  // <button> and other handlers
  // ---------------------------------------------------------------------------------------

  public runIterationsHandler() {
    this.numIterationsToGo = this.numIterationsToExecute
    this.iterateNextStates()
    this.statsAreUpToDate = false
  }
  
  public stopIterationsHandler() {
    this.numIterationsToGo = 0
  }

  public resetSystemHandler() {
    this.setOrResetSystem()
  }

  public fetchStatisticsHandler() {
    this.fetchSystemStatistics()
  }

  public changedStatsIntervalHandler(interval: TimeUnit) {
    this.statsInterval = interval
    this.statsAreUpToDate = false
    this.fetchSystemStatistics()
  }

  // ---------------------------------------------------------------------------------------
  // read system config file  
  // ---------------------------------------------------------------------------------------
  
  filename:         string = ""
  systemId:         string = "- empty -"
  objFromJsonFile:  any 

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

  // ---------------------------------------------------------------------------------------
  // initialize and reset system;
  // fetch statistics  
  // ---------------------------------------------------------------------------------------
  
  private parseAndInititalize(fileContent: string): void {
      this.objFromJsonFile = JSON.parse(fileContent) 
      this.systemId = this.objFromJsonFile.system_id
      this.setOrResetSystem()
  }

  private setOrResetSystem() {
      this.numIterationsToGo = 0
      this.wof.initialize()
      this.systemState$ = this.bas.systemStateOnInitialization(this.objFromJsonFile).pipe(
        catchError((err: any) => {
          this.backendErrorMessage = "*** ERROR: " + err.error.message
          this.showSystemState = false
          return throwError(() => new Error("*** ERROR: " + err.error.message))
        })
      )
      this.systemState$.subscribe(systemState => {
        this.numValueChains = systemState.valueChains.length
        this.processIteration(systemState) 
        this.calcSizeOfUiBoxes() 
        this.backendErrorMessage = ""
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
