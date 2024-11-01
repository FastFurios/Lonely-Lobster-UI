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
                case 403: { errorMessage = 'Access denied. You do not have permission to view this resource.'; break }
                case 500: { errorMessage = 'Internal server error.'; break }
                default:    errorMessage = `Server error: ${error.status} - ${error.message}`
            }
            //errorMessage = "Damn' it, an error has occurred!"
            console.error("handleResponseError$ err.status= " + error.status)
            return throwError(() => new Error(errorMessage))     // Return a user-friendly error message)
        })
    )
}
