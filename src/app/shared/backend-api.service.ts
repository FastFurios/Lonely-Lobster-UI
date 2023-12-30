import { Injectable } from '@angular/core'
import { environment } from '../../environments/environment'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Observable, throwError } from "rxjs"
import { catchError } from "rxjs/operators"
import { I_IterationRequest, I_SystemState, I_SystemStatistics, I_LearningStatsWorkers, TimeUnit } from './io_api_definitions'

// --- service class --------------------

@Injectable({
  providedIn: 'root'
})
export class BackendApiService {
  private API_URL = environment.API_URL

  constructor(private http: HttpClient) { }

  private errorHandler(error: HttpErrorResponse): Observable<any> {
    console.error("errorHandler(): Fehler aufgetreten! message= " + error.message + ", code=" + error.ok)
    console.error(error)
    return throwError(() => error.message /*new Error()*/)
  }

  public systemStateOnInitialization(systemParmsAsJson: any): Observable<I_SystemState> {
    return this.http.post<I_SystemState>(this.API_URL + "initialize/", systemParmsAsJson, { withCredentials: true } /*, {responseType: "json"}*/)
/*      .pipe(
          catchError((error: HttpErrorResponse) => this.errorHandler(error))
        )*/
  }

  public nextSystemStateOnInput(iterationRequest: I_IterationRequest): Observable<I_SystemState> {
      return this.http.post<I_SystemState>(this.API_URL + "iterate/", iterationRequest, { withCredentials: true } /*, {responseType: "json"}*/)
          .pipe(
            catchError((error: HttpErrorResponse) => this.errorHandler(error))
          )
  }
  
  public currentSystemStatistics(interval: TimeUnit): Observable<I_SystemStatistics> {
    return this.http.get<I_SystemStatistics>(this.API_URL + "statistics?interval=" + interval.toString(), { withCredentials: true } /*, {responseType: "json"}*/)
        .pipe(
          catchError((error: HttpErrorResponse) => this.errorHandler(error))
        )
  }

  public learningStatistics(): Observable<I_LearningStatsWorkers> {
    console.log("backend-api-service.learningStatitics()")
    return this.http.get<I_LearningStatsWorkers>(this.API_URL + "learn-stats/", { withCredentials: true } /*, {responseType: "json"}*/)
        .pipe(
          catchError((error: HttpErrorResponse) => this.errorHandler(error))
        )
  }
}
