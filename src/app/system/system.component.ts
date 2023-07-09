import { Component, OnInit, OnChanges, HostListener } from '@angular/core';
//import { Options } from '@angular-slider/ngx-slider';
import { WorkitemsInventoryService } from '../shared/workitems-inventory.service'
import { I_SystemState, PsWorkerUtilization, ValueChainId, VcWithWorkersUtil } from '../shared/io_api_definitions'
import { Observable } from "rxjs"
import { WorkorderFeederService } from '../shared/workorder-feeder.service';
import { UiBoxSize, UiBoxMarginToWindow, UiSystemHeaderHeight, UiWorkerStatsHeight } from '../shared/ui-boxes-definitions';


@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.css']
})
export class SystemComponent implements OnInit, OnChanges {
  systemState$: Observable<I_SystemState> 
  systemState: I_SystemState
  //systemStateStatic: I_SystemState
  vcsWithWorkersUtil: VcWithWorkersUtil[] 
  

  numValueChains: number

  numIterationsToExecute: number = 1
  numIterationsToGo: number

  
  constructor( private wiInvSrv: WorkitemsInventoryService,
               private wof:      WorkorderFeederService ,
               /*private cfr:      ConfigFileReaderService*/) { 

/*
    console.log("SystemComponent.constructor: calling nextIterationStates()...")
    this.nextIterationStates()
    this.systemState$.subscribe(systemState => { this.numValueChains = systemState.valueChains.length; this.calcSizeOfUiBoxes() })
*/
  }

  ngOnInit(): void {
    //console.log("SystemComponent.ngOnInit()")
    this.calcSizeOfUiBoxes()
    
  }
 
  ngOnChanges(): void {
    //console.log("SystemComponent.ngOnInit()")
    this.calcSizeOfUiBoxes()
  }
 

  private nextIterationSubscriber(syst: I_SystemState) {
//  console.log("SystemComponent.nextIterationSubscriber()")
    this.systemState = syst 
    this.calcSizeOfUiBoxes()
//  console.log("SystemComponent.nextIterationState() this.systemState=")
//  console.log(this.systemState)
    //console.log("SystemComponent.nextIterationSubscriber(): systemState.outputBasket.workitems.length=" + this.systemState.outputBasket.workItems.length)

    // add to valuechains data also the corresponding workers with their process step asignments and utilization  
    this.vcsWithWorkersUtil = this.systemState.valueChains
                              .map(vc => { return {
                                vc:       vc,
                                wosUtil:  this.workersUtilOfValueChain(vc.id)
                              }})
                              
    this.numIterationsToGo--
    if (this.numIterationsToGo > 0)
      this.nextIterationStates()

    //this.systemState.valueChains.forEach(vc => this.workersUtilOfValueChain(vc.id))
  }

  public nextIterationStates(): void {
    console.log("SystemComponent.nextIterationStates()")
    //console.log(this.systemState$)
    this.systemState$ = this.wiInvSrv.nextSystemStateOnInput(this.wof.iterationRequest4AllVcs())
    this.systemState$.subscribe(syst => this.nextIterationSubscriber(syst))
  }

  public nextIterationHandler() {
    this.numIterationsToGo = this.numIterationsToExecute
    this.nextIterationStates()
  }
  
  public stopIterationHandler() {
    this.numIterationsToGo = 0
  }

  private workersUtilOfValueChain(vc: ValueChainId): PsWorkerUtilization[] {
    const aux = this.systemState.workersState.filter(woSt => woSt.assignments.some(vcPs => vcPs.valueChain == vc))
                                        .map(woSt => { return { worker:               woSt.worker, 
                                                                utilization:          woSt.utilization,
                                                                assignedProcessSteps: woSt.assignments.map(vcPs => vcPs.processStep)}})

    //console.log("SystemComponent.workersUtilOfValueChain(" + vc + ")=")                                                              
    //console.log(aux)
    return aux                                                              
  }

  
  filename: string = ""
//  sysConfigJsonContent: string

  systemId: string = "- empty -"
  objFromJsonFile: any 

  private parseAndInititalize(fileContent: string): void {
      this.objFromJsonFile = JSON.parse(fileContent) 
      this.systemId  = this.objFromJsonFile.system_id

 //   console.log("SystemComponent.onFileSelected() obj$.subscribe() Lambda executing")
//    console.log("SystemComponent.onFileSelected() objFromJsonFile=")
//    console.log(this.objFromJsonFile)

//    this.wiInvSrv.systemStateOnInitialization(this.objFromJsonFile)
      this.numIterationsToGo = 0
      this.wof.initialize()
      this.systemState$ = this.wiInvSrv.systemStateOnInitialization(this.objFromJsonFile)
      this.systemState$.subscribe(systemState => this.nextIterationSubscriber(systemState))
      this.systemState$.subscribe(systemState => { this.numValueChains = systemState.valueChains.length; this.calcSizeOfUiBoxes() })
  }


  onFileSelected(e: any) { 
    const file: File = e.target.files[0] 
    this.filename = file.name

    const obs$ = this.readFileContentObs(file)
    obs$.subscribe((fileContent: string) => this.parseAndInititalize(fileContent))
  }

  readFileContentObs(file: File): Observable<string> {
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

  

  // ----- (re-)sizing of childs' UI boxes  -------------
  
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
//  console.log("SystemComponent: calcSizeOfUiBoxes() this.numValueChains=" + this.numValueChains)  
//  console.log("SystemComponent: calcSizeOfUiBoxes() this.vcBoxSize=")
//  console.log(this.vcBoxSize)

    this.obBoxSize = { 
      width:  window.innerWidth - this.vcBoxSize.width - UiBoxMarginToWindow,
      height: this.vcsBoxSize.height
    }
  }


}
