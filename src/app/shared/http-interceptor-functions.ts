// interceptor used when this frontend makes API calls to the backend, i.e. adding the token as bearer token to the http header of the API call 

import { inject } from '@angular/core'
import { Observable, throwError, catchError } from 'rxjs'
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http'
import { AuthenticationService } from './authentication.service'
import { ApplicationEvent, EventSeverity, EventTypeId } from './io_api_definitions'
import { EventsService } from './events.service'

// -----------------------------------------------------------------------------------------
// interceptor for outgoing http-requests that should carry a token
// -----------------------------------------------------------------------------------------
export function addAuthTokenToHttpHeader$(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const authService = inject(AuthenticationService) // make my authentication service accessible to this function 
  const authToken = authService.accessToken
/* const l = authToken.length
const s1 = authToken.substring(0, l-50);
const s2 = authToken.substring(l-45);
const s3 = s1 + "_____" + s2;
const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${s3}` }})  // add prefix "Bearer " which indicates to the backend this is a bearer and no user identity token */
  const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${authToken}` }})  // add prefix "Bearer " which indicates to the backend this is a bearer and no user identity token
  return next(authReq);
}

// -----------------------------------------------------------------------------------------
// interceptor for incoming http-responses that catches and handles errors
// -----------------------------------------------------------------------------------------
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
            
            // return throwError(() => new HttpErrorResponse({
            //     headers:      error.headers,
            //     status:       error.status,
            //     statusText:   error.statusText,
            //     url:          error.url ? error.url : undefined,
            //     error:        appEvent  // HttpErrorResponse augmented with the Application Event 
            //   }))

            // if (error.status != 0 && error.status != 401) return throwError(() => error /* error.error*/ /*new Error(errorMessage)*/)     // Return a user-friendly error message)
      }))
}
