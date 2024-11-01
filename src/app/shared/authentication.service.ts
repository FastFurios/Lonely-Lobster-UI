// service that stores the MSAL token in the frontend application 

import { Injectable } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode'

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private _accessToken: string = ""

  constructor() { }

  set accessToken(accessToken: string) {
    this._accessToken = accessToken
  }

  get accessToken(): string {
    return this._accessToken
  }

  get decodedAccessToken(): JwtPayload | null {
    let decodedToken: JwtPayload | null = null 
    try {
          decodedToken = jwtDecode<JwtPayload>(this.accessToken)
          console.log('Decoded Token:', decodedToken)
        } 
    catch (error) {
      console.error('Error decoding token:', error)
      decodedToken = null
    }
    return decodedToken
  }
}
