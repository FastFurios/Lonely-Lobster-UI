//-------------------------------------------------------------------
// APPLICATION STATE SERVICE
//-------------------------------------------------------------------
// last code cleaning: 08.12.2024

import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs"

/** Events that components can signal to the application state service */
export type FrontendEvent                  = "logged-in" | "logged-out" | "config-edit-saved" | "config-uploaded" | "discarded" | "system-instantiated" | undefined

type FrontendStateAndTransitionsId  = 0 | 1 | 2 | 3 | 4

type FrontendStateTransition = {
    event:      FrontendEvent
    newStateId: FrontendStateAndTransitionsId
}

/** Frontend state type*/
export type FrontendState  = {
    isLoggedIn:               boolean
    hasSystemConfiguration:   boolean
    hasBackendSystemInstance: boolean
}

type FrontendStateAndTransitions = FrontendState & {
    transitions:              FrontendStateTransition[]
}

const states: FrontendStateAndTransitions[] = [
    { // 0
      isLoggedIn:               false,
      hasSystemConfiguration:   false,
      hasBackendSystemInstance: false,
      transitions:              [
          { event: 'logged-in',           newStateId: 2},
          { event: 'config-edit-saved',   newStateId: 1},
          { event: 'config-uploaded',     newStateId: 1}
      ]              
    },
    { // 1
      isLoggedIn:               false,
      hasSystemConfiguration:   true,
      hasBackendSystemInstance: false,
      transitions:              [
          { event: 'logged-in',           newStateId: 3},
          { event: 'discarded',           newStateId: 0}
      ]              
    },
    { // 2
      isLoggedIn:               true,
      hasSystemConfiguration:   false,
      hasBackendSystemInstance: false,
      transitions:              [
          { event: 'logged-out',          newStateId: 0},
          { event: 'config-edit-saved',   newStateId: 3},
          { event: 'config-uploaded',     newStateId: 3}
      ]              
    },
    { // 3
      isLoggedIn:               true,
      hasSystemConfiguration:   true,
      hasBackendSystemInstance: false,
      transitions:              [
          { event: 'logged-out',          newStateId: 1},
          { event: 'discarded',           newStateId: 2},
          { event: 'system-instantiated', newStateId: 4}
      ]              
    },
    { // 4
      isLoggedIn:               true,
      hasSystemConfiguration:   true,
      hasBackendSystemInstance: true,
      transitions:              [
          { event: 'logged-out',          newStateId: 1},
          { event: 'config-edit-saved',   newStateId: 3},
          { event: 'config-uploaded',     newStateId: 3},
          { event: 'discarded',           newStateId: 2}
      ]              
    }
]


/**
 * @class This Angular service provides the methods for managing the application state and its transitions triggered by user interactions. 
 * On state transitions this service notifies subscribed components. 
 */
@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private currentStateId: FrontendStateAndTransitionsId = 0

  /** BehaviorSubject by which components can signal an event (using method .next("<event>")) */
  public  frontendEventsSubject$            = new BehaviorSubject<FrontendEvent>(undefined)
  /** BehaviorSubject by which subscribed components can receive the new state after a transition change so they can take appropriate actions  */
  public  frontendNewStateBroadcastSubject$ = new BehaviorSubject<FrontendState>(states[0])  

  /** listen to incoming events from other components and responds with the new state */
  constructor() { 
      this.frontendEventsSubject$.subscribe((e: FrontendEvent) => this.transitionToNewState(e))
  }

  /** 
   * determine the new state on basis of the current state and the event; updates {@link currentStateId} with the new state; 
   * broadcasts the new current state to the components subscribed to {@link frontendNewStateBroadcastSubject$}
   * @param e - event received from a component
  */
  private transitionToNewState(e: FrontendEvent): void {
      if (!e) {
        console.log(`app-state.service: transitionToNewState(): No defined transition => currentState stays unchanged at ${this.currentStateId}`)
        return
      }
      const newStateId =  states[this.currentStateId].transitions.find(t => t.event == e)?.newStateId
      if(newStateId != undefined) {
         this.currentStateId = newStateId
      }
      this.broadcastState()
  }

  /** 
   * broadcasts the current state to the components subscribed to {@link frontendNewStateBroadcastSubject$}
  */
  private broadcastState(): void {
    this.frontendNewStateBroadcastSubject$.next(states[this.currentStateId])
  }  
}
