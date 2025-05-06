//-------------------------------------------------------------------
// BACKEND API SERVICE
//-------------------------------------------------------------------
// last code cleaning: 07.12.2024

import { Injectable } from '@angular/core'
import { environment } from '../../environments/environment'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Observable, throwError } from "rxjs"
import { catchError } from "rxjs/operators"
import { I_IterationRequests, I_SystemState, I_SystemStatistics, I_LearningStatsWorkers, I_ConfigAsJson, ApplicationEvent } from './io_api_definitions'
import { I_WorkItemEvents, TimeInterval } from './frontend_definitions'
import { EventsService } from './events.service'

/**
 * @class This Angular service provides the methods for all requests from a caller to the Lonely Lobster backend.
 * It makes the call to the backend and returns an Observable through which the requested response will be delivered to the caller. 
 * In case the Observable returns an error it first calls an error handler which then signals an error back to the caller. 
 */
@Injectable({
  providedIn: 'root'
})
export class BackendApiService {
  private API_URL = environment.API_URL

  /**
   * @private
   */
  constructor(private http: HttpClient,
              private ess:  EventsService) { }

  /**
   * @private
   * @param {HttpErrorResponse} her - the http error received from the underlying http stack or from the backend. 
   * In case it comes from the backend, the backend added a LonelyLobster application event object in the error property.     
   * @returns an Observable error containing the application eEvent from the backend's response. 
   */  
  private errorHandler(her: HttpErrorResponse): Observable<any> {
    this.ess.add(her.error as ApplicationEvent)
    return throwError(() => her.error.description)
  }

  /**
   * Opens an Observable through which the current system configuration is sent to the Lonely Lobster backend which creates a 
   * Lonely Lobster system instance and returns the initial system state to the caller.   
   * @summary Initalize a Lonely Lobster system in the backend.
   * @param systemConfigAsJson - The current system configuration in the frontend.       
   * @returns an Observable that will eventually return the backend's response which should contain the initial Lonely Lobster system state. 
   */  
  public systemStateOnInitialization(systemConfigAsJson: I_ConfigAsJson): Observable<I_SystemState> {
    return this.http.post<I_SystemState>(this.API_URL + "initialize/", systemConfigAsJson, { withCredentials: true })
      .pipe(
          catchError((error: HttpErrorResponse) => this.errorHandler(error))
      )
  }

  /**
   * Opens an Observable through which a iteration request is sent to the Lonely Lobster backend which calculates 
   * the next Lonely Lobster system state and returns it to the caller.  
   * @summary Get next system state.
   * @param iterationRequests - The arguments for the next iteration(s).       
   * @returns an Observable that will eventually return the backend's response which should contain the next Lonely Lobster system state. 
   */  
  public nextSystemStateOnInput(iterationRequests: I_IterationRequests): Observable<I_SystemState> {
    //console.log("bas.nextSystemStateOnInput: about to send: " + iterationRequests.flatMap(ir => ir.vcsWorkOrders.map(wo => `${wo.valueChainId}: ${wo.numWorkOrders}`)))
    return this.http.post<I_SystemState>(this.API_URL + "iterate/", iterationRequests, { withCredentials: true })
          .pipe(
            catchError((error: HttpErrorResponse) => this.errorHandler(error))
          )
  }
  
  /**
   * Opens an Observable through which a system statistics request is sent to the Lonely Lobster backend which calculates 
   * the current statistics and returns them to the caller.  
   * @summary Get the Lonely Lobster system statistics data.
   * @param interval - The observation interval i.e. how many iterations from now back into the past should be used to generate the statistics.       
   * @returns an Observable that will eventually return the backend's response which should contain the system statistics. 
   */  
  public currentSystemStatistics(interval: TimeInterval): Observable<I_SystemStatistics> {
    return this.http.get<I_SystemStatistics>(this.API_URL + "statistics?interval=" + interval.toString(), { withCredentials: true } /*, {responseType: "json"}*/)
        .pipe(
          catchError((error: HttpErrorResponse) => this.errorHandler(error))
        )
  }

  /**
   * Opens an Observable through which an empty request is sent to the Lonely Lobster backend which calculates 
   * the current usages of the available workitem selection strategies of the workers.  
   * @summary Get the data for the workers' learning and adaption behavior.
   * @returns an Observable that will eventually return the backend's response which should contain the workers' learning and adaption behavior statistics. 
   */  
  public learningStatistics(): Observable<I_LearningStatsWorkers> {
    return this.http.get<I_LearningStatsWorkers>(this.API_URL + "learn-stats/", { withCredentials: true } /*, {responseType: "json"}*/)
        .pipe(
          catchError((error: HttpErrorResponse) => this.errorHandler(error))
        )
  }

  /**
   * Opens an Observable through which an empty request is sent to the Lonely Lobster backend which collects 
   * all lifecycle events of all workitems in the system including end products i.e. workitems already being in the Output Basket. 
   * @summary Get all lifecycle events of all workitems.
   * @returns an Observable that will eventually return all lifecycle events of all workitems in the system. 
   */  
  public workItemEvents(): Observable<I_WorkItemEvents> {
    return this.http.get<I_WorkItemEvents>(this.API_URL + "workitem-events/", { withCredentials: true } /*, {responseType: "json"}*/)
        .pipe(
          catchError((error: HttpErrorResponse) => this.errorHandler(error))
        )
  }

  /**
   * Opens an Observable through which an empty request is sent to the Lonely Lobster backend which drops
   * the system instance in the backend. 
   * @summary Drop the Lonely Lobster system instance.
   * @returns - in case of success empty 
   */  
  public dropSystem(): Observable<any> {
    return this.http.get<any>(this.API_URL + "drop/", { withCredentials: true } /*, {responseType: "json"}*/)
        .pipe(
          catchError((error: HttpErrorResponse) => this.errorHandler(error))
        )
  }
}
