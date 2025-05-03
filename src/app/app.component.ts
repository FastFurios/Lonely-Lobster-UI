//-------------------------------------------------------------------
// APP COMPONENT
//-------------------------------------------------------------------

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
import { WorkorderFeederService } from './shared/workorder-feeder.service'


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

/** holds the content of a parsed work order csv file */
export type WorkOrdersFromFile = {
  header:   string[],
  rows:     number[][]
}
// export type WorkordersForTimestamp = {[key: string]: number}  // object with many properties (key) with numbers as property values 

/**
 * @class This Angular component renders the control bar of the frontend. 
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public  configFilename:     string = ""
  public  workordersFilename: string = ""

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
              private wos:      WorkorderFeederService,
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

  /** upload system configuration json file into the configuration file service */
  public onConfigFileSelected(e: Event): void { 
    const file: File = (<any>e.target).files[0] 
    this.configFilename = file.name
    if (this.cfs.configAsJson()) this.bas.dropSystem()

    const reader = new FileReader()
    reader.readAsText(file)
    reader.onerror = (error) => this.ess.add(EventsService.applicationEventFrom("reading config json file", file.name, EventTypeId.configFileLoadError, EventSeverity.fatal))
    reader.onload = () => {
      (<HTMLInputElement>e.target).value = "" // clear the event input to allow event detection of re-selection of same file
      if (!reader.result) {
        this.ess.add(EventsService.applicationEventFrom("reading config json file", file.name, EventTypeId.configFileLoadError, EventSeverity.fatal))
        return
      }
      try {
        this.cfs.storeConfigAsJson(JSON.parse(reader.result.toString())) 
        this.ess.add(EventsService.applicationEventFrom("parsing JSON from config file", file.name, EventTypeId.configFileLoaded, EventSeverity.info))
      } catch (error) {
        this.ess.add(EventsService.applicationEventFrom("parsing JSON from config file", file.name, EventTypeId.configJsonError, EventSeverity.fatal))
      }
      this.ass.frontendEventsSubject$.next("config-uploaded")
    }
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
    link.download = `${this.configAsJson()?.system_id}_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}_${now.getHours().toString().padStart(2, "0")}-${now.getMinutes().toString().padStart(2, "0")}.${fileExtension}`
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
  //     Uploading a Work Order File  
  // --------------------------------------------------------------------------------------

  /** upload work order load file csv file into the work order feeder service */
  public onWorkordersFileSelected(e: Event): void { 
    const file: File = (<any>e.target).files[0] 
    this.workordersFilename = file.name
    console.log("AppComponent: onWorkloadFileSelected(): uploading workload file = " + this.workordersFilename)

    const reader = new FileReader()

    reader.onload = () => {
      (<HTMLInputElement>e.target).value = "" // clear the event input to allow event detection of re-selection of same file
      if (!reader.result) {
        this.ess.add(EventsService.applicationEventFrom("reading work order csv file", file.name, EventTypeId.workordersFileLoadError, EventSeverity.fatal))
        return
      }
      try {
          const wosFromFile = this.csvTextParse(reader.result.toString())
          console.log(wosFromFile)
          this.wos.storeWorkordersFromFile(file.name, wosFromFile) 
          this.ess.add(EventsService.applicationEventFrom("parsing CSV from work orders file", file.name, EventTypeId.workordersFileLoaded, EventSeverity.info))
      } catch (error) {
          this.ess.add(EventsService.applicationEventFrom((<any>error).error, file.name, EventTypeId.workordersCsvError, EventSeverity.fatal))
      }
      //this.ass.frontendEventsSubject$.next("config-uploaded")
    }
    reader.onerror = (error) => this.ess.add(EventsService.applicationEventFrom("reading work orders file", file.name, EventTypeId.workordersFileLoadError, EventSeverity.fatal))

    reader.readAsText(file)
  }

  private csvTextParse(csvText: string): WorkOrdersFromFile {
      const rawRows = csvText.replace(/\r/g, "").split("\n")
      const header  = rawRows[0].split(";")
      if (header.length < 2)  {
        console.log("app.csvTextParse(): no real content column")
        this.ess.add(EventsService.applicationEventFrom("parsing CSV from work orders file", this.workordersFilename, EventTypeId.workordersCsvErrorNoWorkordersHeader, EventSeverity.fatal))
        throw Error()
      }
      const rows    = rawRows.slice(1) // skip header row
                             .map(r => r.split(";").map(v => parseInt(v)))
                             .filter(r => r.length == header.length) // get rid of all rows with number of vales other than the heaader's 
      return {
          header: header,
          rows:   rows
      }
  }


  // --------------------------------------------------------------------------------------
  //     Downloading a CSV with the workitems' events  
  // --------------------------------------------------------------------------------------

  /** download the work items' lifecycle events to the download folder */
  public onDownloadEvents(): void {
      function workitemEventAsCsvRow(wie: I_WorkItemEvent): string {
          return `${wie.timestamp};${wie.workItemId};${wie.eventType};${wie.valueChainId};${wie.workItemBasketHolderId};${wie.worker ? wie.worker : ""}`
      }
      this.workItemEvents$ = this.bas.workItemEvents()
      this.workItemEvents$.subscribe(wies => {
          const wiesAsStringRows: string[] = ["time; workitem;event;value-chain;process-step; worker"]
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