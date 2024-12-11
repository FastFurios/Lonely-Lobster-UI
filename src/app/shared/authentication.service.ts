//-------------------------------------------------------------------
// AUTHENTICATION SERVICE
//-------------------------------------------------------------------
// last code cleaning: 07.12.2024

import { Injectable } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode'
import { EventSeverity, EventTypeId } from './io_api_definitions'
import { EventsService } from './events.service'

/**
 * @class This service holds the JWT access token aquired from Microsoft Entra ID.  
 */
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private _accessToken: string = ""
  /**
   * @private
   */
  constructor(private ess: EventsService) { }

  /**
   * Setter to stores an access token.  
   * @summary Store an access token.
   * @param accessToken - access token as received from MS Entra ID via the MS Authentication Library (MSAL).       
   */  
  set accessToken(accessToken: string) {
    this._accessToken = accessToken
  }

  /**
   * Getter to read the stored access token.  
   * @summary Read the stored access token.
   * @returns the stored access token       
   */  
  get accessToken(): string {
    return this._accessToken
  }

  /**
   * Decode the access token stored in this service instance. If a problem occures register an application event in the Events service and return null.  
   * @summary Decode the stored access token.
   * @returns the decoded access token as JWT payload or null in case of an error.       
   */  
  get decodedAccessToken(): JwtPayload | null {
    let decodedToken: JwtPayload | null = null 
    try {
          decodedToken = jwtDecode<JwtPayload>(this.accessToken)
          console.log('Decoded Token:', decodedToken)
        } 
    catch (error) {
      console.error('Error decoding token:', error)
      this.ess.add(EventsService.applicationEventFrom("decoding JWT token", "Authentication.Service", EventTypeId.authorizationError, EventSeverity.critical, this.accessToken))
      decodedToken = null
    }
    return decodedToken
  }
}
