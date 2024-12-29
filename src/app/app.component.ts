//-------------------------------------------------------------------
// APP COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 22.12.2024

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
import { I_WorkItemEvent, ApplicationEvent } from './shared/io_api_definitions'
import { I_WorkItemEvents } from './shared/frontend_definitions'
import { AppStateService, FrontendState } from './shared/app-state.service'
import { EventsService, MaterialIconAndCssStyle } from './shared/events.service'
import { EventSeverity, EventTypeId } from './shared/io_api_definitions'


/** list of possible user actions */
type ActionsPossible = {
    login:              boolean,
    run:                boolean,
    downloadConfig:     boolean,
    downloadEvents:     boolean,
    discard:            boolean
}

/** json web token with the user name */
type JwtPayloadWithGivenName = JwtPayload & { given_name: string }

/** application event description, Material Design icon and CSS style */
type EventDisplayDescAndSeverityMatIcon = {
    description:  string
    materialIcon: string
    cssStyle:     string
}

/**
 * @class This Angular component renders the control bar of the frontend. 
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  filename: string = ""
  greyOut = "color: lightgrey;"

  /** frontend version */
  public  version                = environment.version
  /** true if user is logged in */
  public  userIsLoggedIn         = false
  /** true if events list to be displayed */
  public  displayEvents          = false
  /** user name as provided by the JSON web token */
  public  loggedInUserName       = ""
  /** observable by which the lifecycle events of all work item can be read */
  private workItemEvents$: Observable<I_WorkItemEvents>
  /** array that manages which user actions are possible in the current application state */
  public  actionsPossible: ActionsPossible
  /** list of application events */
  public  events:          ApplicationEvent[]

  /** set the initial list of possible user actions */
  constructor(private router:   Router,
              private route:    ActivatedRoute, 
              /** Microsoft Authentication Service */
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

  /** on component initialization, initialize access to Entra ID, subscribe to application events and process new application state */
  ngOnInit() {
      this.mas.initialize()
      this.ass.frontendNewStateBroadcastSubject$.subscribe((state: FrontendState) => {
        this.processNewState(state)
      })
      this.events = this.ess.events 
  }

  /** check if running a Lonely Lobster system in the backend is possible */
  private isRunActionPossible(state: FrontendState): boolean {
      const runPossible = state.hasSystemConfiguration && state.isLoggedIn
      if (this.router.url == "/run" && !runPossible) this.location.back(); // goes back to the last URL in history
      return runPossible
  }

  /** determine action possible dependent on frontend state */
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

  /** system configuration in JSON format */
  configAsJson() {
    return this.cfs.configAsJson()
  }

  // --------------------------------------------------------------------------------------
  //     Logging in and out  
  // --------------------------------------------------------------------------------------

  /** log on to Entra ID, store json web token in the authentication service, determine user name, log application event and send logged-in event to the application state transition service */
  public onLogIn(): void {
    // need to provide the backend's "Application ID URI" with the "scope" appended, here "system.run". Scope needs to be defined in EntraID backend application under "Expose an API";   
    // the "Application ID URI" part will be in the "aud" (audience) claim in the token, the "scope" in the "scp" claim.
    // EntraID will respond with a token that is made only for the use with the specific API and with the exact scope that is required in the call to the API  
    this.mas.loginPopup({scopes: ["api://5797aa9c-0703-46d9-9fba-934498b8e5d6/system.run"]})
      .subscribe({
        next: (authResult: AuthenticationResult) => {
          this.aus.accessToken = authResult.accessToken
          this.loggedInUserName = (<JwtPayloadWithGivenName>this.aus.decodedAccessToken)?.given_name
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

  /** log out of Entra ID, log to application events service, signal to application state transition service */
  public onLogOut(): void {
      this.mas.logout()
      this.ess.add(EventsService.applicationEventFrom("Entra ID login request", "app.component", EventTypeId.loggedOut, EventSeverity.info))
      this.ass.frontendEventsSubject$.next("logged-out")
  }

  // --------------------------------------------------------------------------------------
  //     Discarding Configuration and also the Backend system instance  
  // --------------------------------------------------------------------------------------

  /** discard system in the backend and delete the system configuration in the frontend i.e. in the configuration file service; log to the application event service; signal to the appliation state transition service  */
  public onDiscard(): void {
      this.cfs.discardConfigAsJson()
      this.ass.frontendEventsSubject$.next("discarded")
      this.ess.add(EventsService.applicationEventFrom("Discarding configuration", "app.component", EventTypeId.configDropped, EventSeverity.info))
  
      if (this.userIsLoggedIn) {
          this.bas.dropSystem().subscribe(() => { 
            this.ess.add(EventsService.applicationEventFrom("Dropping system", "app.component", EventTypeId.systemDropped, EventSeverity.info))
            this.router.navigate(["../home"], { relativeTo: this.route })
          })
      }
  }

  // --------------------------------------------------------------------------------------
  //     Uploading a Configuration  
  // --------------------------------------------------------------------------------------

  /** upload system configuration file into the configuration file service */
  public onFileSelected(e: any) { 
    const file: File = e.target.files[0] 
    this.filename = file.name
    if (this.cfs.configAsJson()) this.bas.dropSystem()

    this.readFileContent$(file).subscribe((fileContent: string) => { 
      try {
        this.cfs.storeConfigAsJson(JSON.parse(fileContent)) 
        this.ess.add(EventsService.applicationEventFrom("parsing JSON from config file", file.name, EventTypeId.configFileLoaded, EventSeverity.info))
      } catch (error) {
        this.ess.add(EventsService.applicationEventFrom("parsing JSON from config file", file.name, EventTypeId.configJsonError, EventSeverity.fatal))
      }
      this.ass.frontendEventsSubject$.next("config-uploaded")
    })
    this.router.navigate(["../edit"], { relativeTo: this.route })
  }

  /** read system configuration json file through an observable */
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

  /** write system configuration to json file in the download folder */
  private downloadToFile(blob: Blob, fileExtension: string): void {
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    if (!this.configAsJson) return
    const now = new Date()
    link.download = `${this.configAsJson()?.system_id}_${now.getFullYear()}-${now.getMonth().toString().padStart(2, "0")}-${now.getDay().toString().padStart(2, "0")}_${now.getHours().toString().padStart(2, "0")}-${now.getMinutes().toString().padStart(2, "0")}.${fileExtension}`
    link.click()
    link.remove()
    this.ess.add(EventsService.applicationEventFrom("Downloaded config", "/download", EventTypeId.configDownloaded, EventSeverity.info))
  }

  /** download system configuration to json file */
  public onSaveFile(): void {
    const fileContent = this.cfs.configAsJson()
    const blob = new Blob([JSON.stringify(fileContent, null, "\t")], { type: "application/json" })
    this.downloadToFile(blob, "json")
  }

  // --------------------------------------------------------------------------------------
  //     Downloading a CSV with the workitems' events  
  // --------------------------------------------------------------------------------------

  /** download the work items' lifecycle events to the download folder */
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
  /** toggle display of the application events list */
  public onToggleEventsDisplay(): void { if (this.hasEvents()) this.displayEvents = !this.displayEvents }

  /** true if events in the application events list */
  public hasEvents(): boolean { return this.ess.hasEvents}

  /** display attributes for the youngest application event */
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
