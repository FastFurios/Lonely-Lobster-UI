// interceptor used when this frontend makes API calls to the backend, i.e. adding the token as bearer token to the http header of the API call 

import { inject } from '@angular/core'
import { Observable, throwError, catchError } from 'rxjs'
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http'
import { AuthenticationService } from './authentication.service'

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
            let errorMessage = ''
            switch (error.status) {
                case   0: { errorMessage = 'Unable to connect to the server.'; break }  
                case 401: { errorMessage = 'Unauthorized access. Please log in.'; break }
                case 403: { errorMessage = 'Access denied. You do not have permission to use this resource.'; break }
                case 404: { errorMessage = 'System no longer active probably due to auto dropping when inactive for some time.'; break }
                case 500: { errorMessage = 'Internal server error.'; break }
                default:  { errorMessage = `Server error: ${error.status} - ${error.message}` }
            }
            //errorMessage = "Damn' it, an error has occurred!"
            // console.error("interceptor handleResponseError$() error.status= " + error.status + ", error.message= " + error.message  + ", errorMessage= " + errorMessage + ", error.error= ")
            // console.error(error.error)
            // const ess = inject(EventsService) // make my the Events service accessible to this function 
            // ess.add(error.error)
            // console.error("interceptor handleResponseError$() event-service has the following events:")
            // console.error(ess.events)
            return throwError(() => error /* error.error*/ /*new Error(errorMessage)*/)     // Return a user-friendly error message)
        })
    )
}
