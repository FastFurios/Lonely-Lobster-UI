import { Component, OnInit, OnChanges, HostListener } from '@angular/core';
//import { Options } from '@angular-slider/ngx-slider';
import { WorkitemsInventoryService } from '../shared/workitems-inventory.service'
import { I_IterationRequest,I_SystemState, I_WorkerState, PsWorkerUtilization, ValueChainId, WorkerName, ProcessStepId, VcWithWorkersUtil } from '../shared/io_api_definitions'
import { Observable } from "rxjs"
import { WorkorderFeederService } from '../shared/workorder-feeder.service';
import { UiBoxSize, UiBoxMarginToWindow, UiSystemHeaderHeight, UiWorkerStatsHeight, UiObHeaderHeight } from '../shared/ui-boxes-definitions';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
import { catchError } from "rxjs/operators"
import { ConfigFileReaderService } from '../shared/config-file-reader.service';


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
               private cfr:      ConfigFileReaderService) { 
    this.nextIterationStates()
    this.systemState$.subscribe(systemState => { this.numValueChains = systemState.valueChains.length; this.calcSizeOfUiBoxes() })
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
    this.systemState = syst 
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
    //console.log(this.systemState$)
    this.systemState$ = this.wiInvSrv.nextSystemStateOnInput(this.wof.iterationRequest4AllVcs())
    this.systemState$.subscribe(syst => this.nextIterationSubscriber(syst))
  }

  public nextIterationHandler() {
    this.numIterationsToGo = this.numIterationsToExecute
    this.nextIterationStates()
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
  sysConfigJsonContent: string

  onFileSelected(e: Event) { 
    this.filename = this.filename.substring(this.filename.lastIndexOf('\\') + 1)

    this.cfr.getJsonFile(this.filename).subscribe(data => {
      console.log("SystemComponent.onFileSelected(): filename = " + this.filename)
      this.sysConfigJsonContent = data
      console.log("SystemComponent.onFileSelected(): cfr.sysConfigJson =")
      console.log(this.sysConfigJsonContent)
    })

  }

  readSystemConfigFile(filename : string) : void {
 /*     // read system parameter JSON file
      let paramsAsString : string = ""
      try { paramsAsString  = readFileSync(filename, "utf8") } 
      catch (e: any) {
          switch (e.code) {
              case "ENOENT" : { throw new Error("System parameter file not found: " + e) }
              default       : { throw new Error("System parameter file: other error: " + e.message) }
          }   
      } 
      finally {}
  
      const paj = JSON.parse(paramsAsString)  // "paj" = parameters as JSON 
      console.log("SystemComponent.readSystemConfigFile(" + filename + ")=")
      console.log(paj)

    // https://blog.angular-university.io/angular-file-upload/
//    if (!event.target.files[0]) return 

    const file:File = event[target].files[0]

    if (file) {

        this.fileName = file.name;

        const formData = new FormData();

        formData.append("thumbnail", file);

        const upload$ = this.http.post("/api/thumbnail-upload", formData);

        upload$.subscribe();
    }
*/
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
    this.obBoxSize = { 
      width:  window.innerWidth - this.vcBoxSize.width - UiBoxMarginToWindow,
      height: this.vcsBoxSize.height
    }
  }


}
