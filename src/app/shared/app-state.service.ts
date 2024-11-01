import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs"


export type FrontendEvent                  = "logged-in" | "logged-out" | "config-edit-saved" | "config-uploaded" | "discarded" | "system-instantiated" | undefined

type FrontendStateAndTransitionsId  = 0 | 1 | 2 | 3 | 4

type FrontendStateTransition = {
    event:      FrontendEvent
    newStateId: FrontendStateAndTransitionsId
}

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


@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private currentStateId: FrontendStateAndTransitionsId = 0

  public  frontendEventsSubject$            = new BehaviorSubject<FrontendEvent>(undefined)//.asObservable()  // components notify this service about events
  public  frontendNewStateBroadcastSubject$ = new BehaviorSubject<FrontendState>(states[0])  // the new state is broadcasted to the components so they can take appropriate actions 

  constructor() { 
      this.frontendEventsSubject$.subscribe((e: FrontendEvent) => this.transitionToNewState(e))
  }

  private transitionToNewState(e: FrontendEvent): void {
      if (!e) return
      console.log(`app-state.servce: newState(): Current state= ${this.currentStateId}, received event=${e}, possible transitions= ${states[this.currentStateId].transitions.map(t => `${t.event}=>${t.newStateId}`)}`)
      const newStateId =  states[this.currentStateId].transitions.find(t => t.event == e)?.newStateId
      if (!newStateId) return // no state transition // throw Error(`app-state.servce: newState(): Could not make state transition as I could not find a matching transition entry. Current state= ${this.currentStateId}, received event=${e}`)
      this.currentStateId = newStateId
      this.broadcastState()
      console.log(`app-state.servce: newState(): New current state= ${this.currentStateId}`)
  }

  private broadcastState(): void {
      this.frontendNewStateBroadcastSubject$.next(states[this.currentStateId])
  }  
}
