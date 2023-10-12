import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment'
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from "rxjs"
import { catchError } from "rxjs/operators"

import { I_IterationRequest, I_SystemState, I_SystemStatistics, TimeUnit } from './io_api_definitions'



// --- service class --------------------


@Injectable({
  providedIn: 'root'
})
export class WorkitemsInventoryService {
  private time: number = 0
  private API_URL= environment.API_URL;

  constructor(private http: HttpClient) { }

  private errorHandler(error: HttpErrorResponse): Observable<any> {
    console.error("errorHandler(): Fehler aufgetreten!" + error.message + error.ok)
    return throwError(() => "error" /*new Error()*/)
  }

/*  
  get nextSystemState(): Observable<I_SystemState> {
    console.log("WorkitemsInventoryService: nextSystemState(): returning Observable")
    return this.http.get<I_SystemState>("http://localhost:8080/iterate/").pipe(
//      retry(3), 
      catchError(this.errorHandler),
    ) 
  }
*/
  
  systemStateOnInitialization(systemParmsAsJson: any): Observable<I_SystemState> {
//console.log("WorkItemInventoryService: systemStateOnInitialization(...): ")
    console.log("WorkItemInventoryService: systemStateOnInitialization(...): systemParmsAsJson=")
    console.log(systemParmsAsJson)
    return this.http.post<I_SystemState>(this.API_URL +"initialize/", systemParmsAsJson, { withCredentials: true } /*, {responseType: "json"}*/)
        .pipe(
          catchError((error: HttpErrorResponse) =>this.errorHandler(error))
        )
    
  }

  nextSystemStateOnInput(iterationRequest: I_IterationRequest): Observable<I_SystemState> {
//  console.log("WorkItemInventoryService: nextSystemStateOnInput(...): iterationRequest=")
//  console.log(iterationRequest)
      return this.http.post<I_SystemState>(this.API_URL + "iterate/", iterationRequest, { withCredentials: true } /*, {responseType: "json"}*/)
          .pipe(
            catchError((error: HttpErrorResponse) =>this.errorHandler(error))
          )
        
  }
  
  currentSystemStatistics(interval: TimeUnit): Observable<I_SystemStatistics> {
//  console.log("WorkItemInventoryService: currentSystemStatistics(...): interval=" + interval)
    return this.http.get<I_SystemStatistics>(this.API_URL + "statistics?interval=" + interval.toString(), { withCredentials: true } /*, {responseType: "json"}*/)
              .pipe(
                catchError((error: HttpErrorResponse) =>this.errorHandler(error))
              )
            
  }

}
