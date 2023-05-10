import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from "rxjs"
import { map, retry, catchError } from "rxjs/operators"




// ######################################################################
// ## Lonely Lobster API definitions 
// ######################################################################

// to-do: share these definitions as project references wth backend and frontend
// see: https://wallis.dev/blog/typescript-project-references

type Effort         = number // measured in Worker Time Units
type Value          = number // measured in Worker Time Units
type ValueChainId   = string
type ProcessStepId  = string
type WorkItemId     = number
type WorkItemTag    = [string, string]
type WorkerName     = string

// request to iterate

interface I_IterationRequest {
  time?: number
  newWorkOrders: {
      valueChainId:ValueChainId 
      numWorkOrders: number
  }[]
}

// response on "iterate" request

interface I_WorkItem {
    id:                             WorkItemId
    tag:                            WorkItemTag
    accumulatedEffortInProcessStep: number
    elapsedTimeInProcessStep:       number
}

interface I_ProcessStep {
    id:                             ProcessStepId
    normEffort:                     Effort
    workItems:                      I_WorkItem[]
    workItemFlow:                   number
}

interface I_ValueChain {
    id:                             ValueChainId
    totalValueAdd:                  Value
    processSteps:                   I_ProcessStep[]
}

interface I_EndProduct {
    id:                             WorkItemId
    tag:                            WorkItemTag
    accumulatedEffortInValueChain:  number
    valueOfValueChain:              Value
    elapsedTimeInValueChain:        number
}

interface I_OutputBasket {
    workItems:                      I_EndProduct[]
}

interface I_WorkerState {
    worker:                         WorkerName
    utilization:                    number
}


interface I_SystemState {
    id:                             string,
    valueChains:                    I_ValueChain[]
    outputBasket:                   I_OutputBasket
    workerUtilization:              I_WorkerState[]
}




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

  
  get nextSystemStateOnInput(): Observable<I_SystemState> {
    const body: I_IterationRequest =
      { time: ++this.time, 
        newWorkOrders: [
          { valueChainId: "Blue",   numWorkOrders: 1 },
          { valueChainId: "Green",  numWorkOrders: 1 }
        ]
      }
    return this.http.post<I_SystemState>("http://localhost:3000/", body /*, {responseType: "json"}*/)
        .pipe(
          catchError((error: HttpErrorResponse) =>this.errorHandler(error))
        )
    
  }

}
