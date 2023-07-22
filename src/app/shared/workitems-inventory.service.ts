import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from "rxjs"
import { catchError } from "rxjs/operators"

import { I_IterationRequest, I_SystemState, I_SystemStatistics } from './io_api_definitions'



// --- service class --------------------


@Injectable({
  providedIn: 'root'
})
export class WorkitemsInventoryService {
  private time: number = 0

  constructor(private http: HttpClient) { }

  private errorHandler(error: HttpErrorResponse): Observable<any> {
    console.error("errorHandler(): Fehler aufgetreten!" + error.message + error.ok)
    return throwError(() => "error" /*new Error()*/)
  }

/*  
  get nextSystemState(): Observable<I_SystemState> {
    console.log("WorkitemsInventoryService: nextSystemState(): returning Observable")
    return this.http.get<I_SystemState>("http://localhost:3000/iterate/").pipe(
//      retry(3), 
      catchError(this.errorHandler),
    ) 
  }
*/
  
  systemStateOnInitialization(systemParmsAsJson: any): Observable<I_SystemState> {
//  console.log("WorkItemInventoryService: systemStateOnInitialization(...): systemParmsAsJson=")
//  console.log(systemParmsAsJson)
    return this.http.post<I_SystemState>("http://localhost:3000/initialize/", systemParmsAsJson /*, {responseType: "json"}*/)
        .pipe(
          catchError((error: HttpErrorResponse) =>this.errorHandler(error))
        )
    
  }

  nextSystemStateOnInput(iterationRequest: I_IterationRequest): Observable<I_SystemState> {
//  console.log("WorkItemInventoryService: nextSystemStateOnInput(...): iterationRequest=")
//  console.log(iterationRequest)
      return this.http.post<I_SystemState>("http://localhost:3000/iterate/", iterationRequest /*, {responseType: "json"}*/)
          .pipe(
            catchError((error: HttpErrorResponse) =>this.errorHandler(error))
          )
        
  }
  
  currentSystemStatistics(): Observable<I_SystemStatistics> {
      return this.http.get<I_SystemStatistics>("http://localhost:3000/statistics/"/*, {responseType: "json"}*/)
              .pipe(
                catchError((error: HttpErrorResponse) =>this.errorHandler(error))
              )
            
  }

}
