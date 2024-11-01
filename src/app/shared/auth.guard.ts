import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthenticationService } from './authentication.service';
import { AppStateService, FrontendState } from './app-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private frontendState: FrontendState | undefined = undefined

  constructor(private ats: AppStateService) { 
      this.ats.frontendNewStateBroadcastSubject$.subscribe((state: FrontendState) => {
          this.frontendState = state
      })
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      console.log(`AuthGuard.canActivate(): Can run? Will return ${this.frontendState?.isLoggedIn}`)
      return (this.frontendState?.isLoggedIn && this.frontendState?.hasSystemConfiguration) || false    // no access token no navigating to that route
  }
}