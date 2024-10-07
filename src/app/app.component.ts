import { Component } from '@angular/core';
import { environment } from '../environments/environment.prod';
import { ConfigFileService } from './shared/config-file.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from "rxjs"

import { BackendApiService } from './shared/backend-api.service';
import { I_WorkItemEvents, I_WorkItemEvent } from './shared/io_api_definitions';

const greyOut = "color: lightgrey;"
/*type IsEnabled = {
  upload:   boolean,
  edit:     boolean,
  run:      boolean,
  download: boolean,
  discard:  boolean
}*/

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = "lonely-lobster"
  filename: string = ""

  public version               = environment.version
  public canRunDownloadDiscard = false
  private workItemEvents$: Observable<I_WorkItemEvents>

  constructor(
    private router: Router,
    private route:  ActivatedRoute, 
    private cfs:    ConfigFileService,
    private bas:    BackendApiService) { }

  ngOnInit() {
    this.cfs.componentEventSubject$.subscribe((compEvent:string) => {
      if (compEvent == "EditorSaveEvent") this.processComponentEvent(compEvent)
    })
  }

  private processComponentEvent(compEvent: string): void {
    this.canRunDownloadDiscard = compEvent == "EditorSaveEvent"
    //console.log("App.processComponentEvent(): compEvent= " + compEvent + "; this.canRunDownloadDiscard= " + this.canRunDownloadDiscard)
  }

  public runDownloadDiscardColor(): string | undefined {
    return this.canRunDownloadDiscard ? undefined : greyOut 
  }  

  get configAsJson() {
    return this.cfs.configAsJson
  }

  public discard(): void {
    this.cfs.configAsJson = undefined
    this.canRunDownloadDiscard = false
    this.router.navigate(["../home"], { relativeTo: this.route })
  }

  public updateCanRunDownloadDiscard() {
    //console.log("AppComponent: updateCanRunDownloadDiscard()")
    this.canRunDownloadDiscard = this.cfs.configAsJson ? true : false
  }

  public onFileSelected(e: any) { 
    //console.log("onFileSelected")
    const file: File = e.target.files[0] 
    this.filename = file.name
//  console.log(`app: onFileSelected(): filename=${this.filename}; subscribing to observable ...`)
    const obs$ = this.readFileContentObs(file)
    obs$.subscribe((fileContent: string) => { 
      //this.cfs.configAsJson = fileContent
      this.cfs.configAsJson = JSON.parse(fileContent) 
      //this.router.navigate(["../edit"], { relativeTo: this.route })
      //console.log(`config-file.service: cfs.configObject=`)
      //console.log(this.cfs.configObject)
      this.canRunDownloadDiscard = true
      this.cfs.componentEvent = "ConfigLoadEvent"
//    this.router.navigate(["../home"], { relativeTo: this.route })
//    console.log(this.cfs.objFromJsonFile)
    })
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
      reader.onerror = (error) => subscriber.error(error)
      reader.readAsText(file)
    })
  }


  private downloadToFile(blob: Blob): void {
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = this.filename
    link.click()
    link.remove()
  }

  public onSaveFile(): void {
    const fileContent = this.cfs.configAsJson
    const blob = new Blob([JSON.stringify(fileContent, null, "\t")], { type: "application/json" })
    this.downloadToFile(blob)
  }

  public onDownloadEvents(): void {
    function workitemEventAsCsvRow(wie: I_WorkItemEvent): string {
      return `${wie.system};${wie.timestamp};${wie.workitem};${wie.eventType};${wie.valueChain};${wie.processStep};${wie.worker ? wie.worker : ""}`
    }
    this.workItemEvents$ = this.bas.workItemEvents()
    this.workItemEvents$.subscribe(wies => {
      const wiesAsStringRows: string[] = ["system; time; workitem;event;value-chain;process-step; worker"]
                                        .concat(wies.map(wie => workitemEventAsCsvRow(wie)))
      const csvContent = wiesAsStringRows.join('\n')
      const blob = new Blob([csvContent], { type: "text/csv" })
      this.downloadToFile(blob)
    })
  }
}
