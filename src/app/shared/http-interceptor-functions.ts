// interceptor used when this frontend makes API calls to the backend, i.e. adding the token as bearer token to the http header of the API call 

import { inject } from '@angular/core'
import { Observable, throwError, catchError } from 'rxjs'
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http'
import { AuthenticationService } from './authentication.service'
import { ApplicationEvent, EventSeverity, EventTypeId } from './io_api_definitions'
import { environment } from '../../environments/environment.prod'
import { AppComponent } from '../app.component'
import { applicationEventFrom } from './helpers'


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
            // if backend set the error status != 0 then pass this thru to the requester w/o any changes
            if (error.status != 0) return throwError(() => error /* error.error*/ /*new Error(errorMessage)*/)     // Return a user-friendly error message)

            // error status == 0, i.e. no proper http error status from the server. Indicates local network problem.  
            // create an Application Event with the available data from the error
            const appEvent: ApplicationEvent = applicationEventFrom("http-request", `${error.statusText}: ${error.url}`, EventTypeId.networkProblems, EventSeverity.critical)

            // incorporate the ApplicationEvent into an augmented HtpErrorResponse and pass it to the requester
            return throwError(() => new HttpErrorResponse({
                headers:      error.headers,
                status:       error.status,
                statusText:   error.statusText,
                url:          error.url ? error.url : undefined,
                error:        appEvent  // HttpErrorResponse augmented with the Application Event 
            }))
      }))
}
