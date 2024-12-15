//-------------------------------------------------------------------
// INTERCEPTOR FUNCTIONS
//-------------------------------------------------------------------
// last code cleaning: 15.12.2024

import { inject } from '@angular/core'
import { Observable, throwError, catchError } from 'rxjs'
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http'
import { AuthenticationService } from './authentication.service'
import { ApplicationEvent, EventSeverity, EventTypeId } from './io_api_definitions'
import { EventsService } from './events.service'

/**
 * Adds a bearer token to outgoing requests to the backend
 * @param req - the http request provided by Angular runtime
 * @param next - the http handler function provided by Angular runtime
 * @returns http request augmented by the acquired token as a bearer token
 */
export function addAuthTokenToHttpHeader$(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const authService = inject(AuthenticationService) // make my authentication service accessible to this function 
  const authToken = authService.accessToken
  const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${authToken}` }})  // add prefix "Bearer " which indicates to the backend this is a bearer and no user identity token
  return next(authReq);
}

// -----------------------------------------------------------------------------------------
// interceptor for incoming http-responses that catches and handles errors
// -----------------------------------------------------------------------------------------
/**
 * Intercepts responses for requests to the backend:
 * Passes through the response to the requester unchanged if no error.
 * If an error occurred: 
 * - before the backend could have been even reached, i.e. it is a local http error (status == 0), or 
 * - the error response comes from the backend's Express middleware before a route handler had its hands on it,
 * then create a Lonely Lobster application event and add it to the http error and deliver it to the requester.
 * Otherwise if the error was already handled explicitely by a route handler in the backend and therefore the response contains already a Lonely Lobster application event, deliver the error to the requester. 
 * @param req - the http request, well probably the http response from the backend, provided by Angular runtime
 * @param next - the http handler function provided by Angular runtime
 * @returns observable that passes the http response through unchanged if everything is OK, otherwise pass an error augmented by a Lonely Lobster application event
 */
export function handleResponseError$(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {  // derived from ChatGPT suggestion
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let appEvent: ApplicationEvent
            switch (error.status) {
                case 0: { // no proper http error status from the server. Indicates local network problem. Create an Application Event with the available data from the error
                    appEvent = EventsService.applicationEventFrom("http-request", `${error.statusText}: ${error.url}`, EventTypeId.networkProblems, EventSeverity.critical)
                    break
                }
                case 401: { // request rejected by express middleware due to invalid or missing token. Create an Application Event with the available data from the error
                    appEvent = EventsService.applicationEventFrom("http-request", `${error.statusText}: ${error.url}`, EventTypeId.authorizationError, EventSeverity.critical)
                    break
                }
                default: { // for other error.status the backend should have attached a proper Appliction Event to the HttpErrorResponse's error property
                    return throwError(() => error)
                }
            }
            // special treatment required i.e. appEvent to be attached to HttpErrorResponse's error property and pass the augmented HttpErrorResponse to the requester
            const augmentedHttpErrorResponse = {
              ...error,
              error: appEvent
            }
            return throwError(() => augmentedHttpErrorResponse)
      }))
}
