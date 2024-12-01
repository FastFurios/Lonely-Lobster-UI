import { Component } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { environment } from '../environments/environment.prod'
import { Observable } from "rxjs"
import { Location } from '@angular/common'

import { MsalService } from "@azure/msal-angular" // MSAL = Microsoft Authentication Library
import { AuthenticationResult } from "@azure/msal-browser"
import { AuthenticationService } from './shared/authentication.service'
import { JwtPayload } from 'jwt-decode'

import { ConfigFileService } from './shared/config-file.service'
import { BackendApiService } from './shared/backend-api.service'
import { I_WorkItemEvents, I_WorkItemEvent, ApplicationEvent } from './shared/io_api_definitions'
import { AppStateService, FrontendState } from './shared/app-state.service'
import { EventsService, MaterialIconAndColor as MaterialIconAndCssStyle } from './shared/events.service'
import { EventSeverity, EventTypeId } from './shared/io_api_definitions'



type ActionsPossible = {
    login:              boolean,
    run:                boolean,
    downloadConfig:     boolean,
    downloadEvents:     boolean,
    discard:            boolean
}

type JwtPayloadWithGivenName = JwtPayload & { given_name: string }

type EventDisplayDescAndSeverityMatIcon = {
    description:  string
    materialIcon: string
    cssStyle:     string
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  //title = "Lonely-Lobster"
  filename: string = ""
  greyOut = "color: lightgrey;"

  public  version                = environment.version
  public  canRun                 = false
  public  canDownloadDiscard     = false
  public  userIsLoggedIn         = false
  public  displayEvents          = false
  public  loggedInUserName       = ""
  private workItemEvents$: Observable<I_WorkItemEvents>
  public  actionsPossible: ActionsPossible
  public  events:          ApplicationEvent[]

  constructor(
    private router:   Router,
    private route:    ActivatedRoute, 
    private mas:      MsalService, 
    private aus:      AuthenticationService,
    private cfs:      ConfigFileService,
    private ass:      AppStateService,
    private bas:      BackendApiService,
    private ess:      EventsService,
    private location: Location) { 
      this.actionsPossible = {
          login:              true,
          run:                false,
          downloadConfig:     false,
          downloadEvents:     false,
          discard:            false
      }
  }

  ngOnInit() {
      this.mas.initialize()
      this.ass.frontendNewStateBroadcastSubject$.subscribe((state: FrontendState) => {
        this.processNewState(state)
      })
      this.events = this.ess.events 
  }

  private isRunActionPossible(state: FrontendState): boolean {
      const runPossible = state.hasSystemConfiguration && state.isLoggedIn
      if (this.router.url == "/run" && !runPossible) this.location.back(); // goes back to the last URL in history
      return runPossible
  }

  private processNewState(state: FrontendState): void {
      this.userIsLoggedIn = state.isLoggedIn
      this.actionsPossible = {
          login:          !state.isLoggedIn,
          run:            this.isRunActionPossible(state),
          downloadConfig: state.hasSystemConfiguration,
          downloadEvents: state.hasBackendSystemInstance,
          discard:        state.hasSystemConfiguration 
      }
  }

  get configAsJson() {
    return this.cfs.configAsJson
  }
  public updateCanRunDownloadDiscard(): void { // *** tbd
  }


  // --------------------------------------------------------------------------------------
  //     Logging in and out  
  // --------------------------------------------------------------------------------------

  public onLogIn(): void {
    // need to provide the backend's "Application ID URI" with the "scope" appended, here "system.run". Scope needs to be defined in EntraID backend application under "Expose an API";   
    // the "Application ID URI" part will be in the "aud" (audience) claim in the token, the "scope" in the "scp" claim.
    // EntraID will respond with a token that is made only for the use with the specific API and with the exact scope that is required in the call to the API  
    this.mas.loginPopup({scopes: ["api://5797aa9c-0703-46d9-9fba-934498b8e5d6/system.run"]})
      .subscribe({
        next: (authResult: AuthenticationResult) => {
//        this.msalLoginStatus = "ok"
          this.aus.accessToken = authResult.accessToken
          console.log("AppComponent.onLogIn(): this.aus.accessToken= " + this.aus.accessToken)
          this.loggedInUserName = (<JwtPayloadWithGivenName>this.aus.decodedAccessToken)?.given_name
          console.log(`AppComponent.onLogIn(): send "logged-in" to ATS`)
          this.ess.add(EventsService.applicationEventFrom("Entra ID login request", "app.component", EventTypeId.loggedIn, EventSeverity.info))
          this.ass.frontendEventsSubject$.next("logged-in")
        },
        error: (err: Error) => {
          console.log("app.login.mas.loginPopup().error: err.message = " + err.message)
          console.log(`AppComponent.onLogIn(): authentication error; send "logged-out" to ATS`)
          this.ess.add(EventsService.applicationEventFrom("Entra ID login request", "app.component", EventTypeId.networkProblems, EventSeverity.critical, err.message))
          this.ass.frontendEventsSubject$.next("logged-out")
        }
    })
  }

  public onLogOut(): void {
      this.mas.logout()
      console.log(`AppComponent.onLogOut(): send "logged-out" to ATS`)
      this.ess.add(EventsService.applicationEventFrom("Entra ID login request", "app.component", EventTypeId.loggedOut, EventSeverity.info))
      this.ass.frontendEventsSubject$.next("logged-out")
  }

  // --------------------------------------------------------------------------------------
  //     Discarding Configuration and also the Backend system instance  
  // --------------------------------------------------------------------------------------

  public onDiscard(): void {
      this.cfs.configAsJson = undefined
      this.ess.add(EventsService.applicationEventFrom("Discarding configuration", "app.component", EventTypeId.configDropped, EventSeverity.info))
  
      if (this.userIsLoggedIn) {
          this.bas.dropSystem().subscribe(() => { 
            this.ess.add(EventsService.applicationEventFrom("Dropping system", "app.component", EventTypeId.systemDropped, EventSeverity.info))
            // console.log("AppComponent.onDiscard(): response to drop request received") 
            // console.log(`AppComponent.onDiscard(): send "discarded" to ATS`)
            this.ass.frontendEventsSubject$.next("discarded")
            // tbc: add API call to backend to destroy the Lonely Lobster system for this session
            this.router.navigate(["../home"], { relativeTo: this.route })
          })
      }
  }

  // --------------------------------------------------------------------------------------
  //     Uploading a Configuration  
  // --------------------------------------------------------------------------------------

  public onFileSelected(e: any) { 
    //console.log("onFileSelected")
    const file: File = e.target.files[0] 
    this.filename = file.name
//  console.log(`app: onFileSelected(): filename=${this.filename}; subscribing to observable ...`)
    if (this.cfs.configAsJson) this.bas.dropSystem()
      //.subscribe(() => console.log("AppComponent.onFileSelected(): response to drop request received"))

    this.readFileContent$(file).subscribe((fileContent: string) => { 
      //this.cfs.configAsJson = fileContent
      try {
        this.cfs.configAsJson = JSON.parse(fileContent) 
        this.ess.add(EventsService.applicationEventFrom("parsing JSON from config file", file.name, EventTypeId.configFileLoaded, EventSeverity.info))
      } catch (error) {
        this.ess.add(EventsService.applicationEventFrom("parsing JSON from config file", file.name, EventTypeId.configJsonError, EventSeverity.fatal))
      }
      //this.router.navigate(["../edit"], { relativeTo: this.route })
      //console.log(`config-file.service: cfs.configObject=`)
      //console.log(this.cfs.configObject)
      console.log(`AppComponent.onFileSelected(): send "config-uploaded" to ATS`)
      this.ass.frontendEventsSubject$.next("config-uploaded")
//    this.cfs.componentEvent = "ConfigLoadEvent"
//    this.router.navigate(["../home"], { relativeTo: this.route })
//    console.log(this.cfs.objFromJsonFile)
    })
    this.router.navigate(["../home"], { relativeTo: this.route })
  }

  private readFileContent$(file: File): Observable<string> {
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

  // --------------------------------------------------------------------------------------
  //     Downloading a Configuration  
  // --------------------------------------------------------------------------------------

  private downloadToFile(blob: Blob, fileExtension: string): void {
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    if (!this.configAsJson) return
    const now = new Date()
    link.download = `${this.configAsJson.system_id}_${now.getFullYear()}-${now.getMonth().toString().padStart(2, "0")}-${now.getDay().toString().padStart(2, "0")}_${now.getHours().toString().padStart(2, "0")}-${now.getMinutes().toString().padStart(2, "0")}.${fileExtension}`
    link.click()
    link.remove()
    this.ess.add(EventsService.applicationEventFrom("Downloaded config", "/download", EventTypeId.configDownloaded, EventSeverity.info))
  }

  public onSaveFile(): void {
    const fileContent = this.cfs.configAsJson
    const blob = new Blob([JSON.stringify(fileContent, null, "\t")], { type: "application/json" })
    this.downloadToFile(blob, "json")
  }

  // --------------------------------------------------------------------------------------
  //     Downloading a CSV with the workitems' events  
  // --------------------------------------------------------------------------------------

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
          this.downloadToFile(blob, "csv")
          this.ess.add(EventsService.applicationEventFrom("Downloaded statistic events", "/download", EventTypeId.statsEventsDownloaded, EventSeverity.info))
      })
  }

  // --------------------------------------------------------------------------------------
  //     Display application events list  
  // --------------------------------------------------------------------------------------
  public onToggleEventsDisplay(): void { if (this.hasEvents()) this.displayEvents = !this.displayEvents }

  public hasEvents(): boolean { return this.ess.hasEvents}

  get latestEventDescAndSevMatIcon(): EventDisplayDescAndSeverityMatIcon {
    if (!this.hasEvents()) return { 
        description:  "",
        materialIcon: "",
        cssStyle:     ""
      }
    const c_lengthEventDisplay = 50 
    const latestEvent: ApplicationEvent = this.events[this.events.length - 1]
    const latestEventMatIconAndCssStyle: MaterialIconAndCssStyle = EventsService.materialIconAndCssStyle(latestEvent.severity)
    return { 
        description:  latestEvent.description.length < c_lengthEventDisplay ? latestEvent.description : latestEvent.description.substring(0, c_lengthEventDisplay - 3) +"...",
        materialIcon: latestEventMatIconAndCssStyle.materialIcon,
        cssStyle:     latestEventMatIconAndCssStyle.cssStyle
    }
  }
  
}
