//-------------------------------------------------------------------
// AUTHENTICATION GUARD SERVICE
//-------------------------------------------------------------------
// last code cleaning: 08.12.2024

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AppStateService, FrontendState } from './app-state.service';

/**
 * @class This Angular service controls whether the user can navigate to the run page e.g. when entering the URL ending with /run 
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private frontendState: FrontendState | undefined = undefined

  /** Subscribes to the {@link AppStateService} and stores the current state locally */
  constructor(private ats: AppStateService) { 
      this.ats.frontendNewStateBroadcastSubject$.subscribe((state: FrontendState) => {
          this.frontendState = state
      })
  }

  /** 
   * Controls whether the user can navigate to the run page
   * @param - route and state: not used  
   * @returns true if user can navigate to run page, else false 
   */
  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return (this.frontendState?.isLoggedIn && this.frontendState?.hasSystemConfiguration) || false    // no access token no navigating to that route
  }
}