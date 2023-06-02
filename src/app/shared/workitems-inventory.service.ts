import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from "rxjs"
import { catchError } from "rxjs/operators"

import { I_IterationRequest, I_SystemState } from './io_api_definitions'



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

  get nextSystemState(): Observable<I_SystemState> {
    return this.http.get<I_SystemState>("http://localhost:3000/").pipe(
//      retry(3), 
      catchError(this.errorHandler),
    ) 
  }

  
  nextSystemStateOnInput(body: I_IterationRequest): Observable<I_SystemState> {
    return this.http.post<I_SystemState>("http://localhost:3000/", body /*, {responseType: "json"}*/)
        .pipe(
          catchError((error: HttpErrorResponse) =>this.errorHandler(error))
        )
    
  }

}
