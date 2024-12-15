//-------------------------------------------------------------------
// CONFIGURATION FILE SERVICE
//-------------------------------------------------------------------
// last code cleaning: 15.12.2024

import { Injectable } from '@angular/core'
import { environment } from '../../environments/environment'
import { EventTypeId, EventSeverity, ApplicationEvent } from './io_api_definitions'
  
/**
 * Struct that holds the name of a Material Icon and the CSS style how to display it
 */
export type MaterialIconAndCssStyle = {
    materialIcon: string
    cssStyle:     string
}

/**
 * @class Stores a list of the application events occurred in both front- and backend    
 */
@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private _events: ApplicationEvent[] = []

  /**
   * @private
   */
  constructor() { }

  /** 
   * Add an application event to he events list
   * @param appEvent - the new application event 
   */
  public add(appEvent: ApplicationEvent): void { 
    this._events.push(appEvent) 
  }

  /** 
   * Get the list of application events 
   * @returns the list of events   
   */
  get events(): ApplicationEvent[] { return this._events }

  /** 
   * Check if events in the list 
   * @returns true if at least one event in the list, else false   
   */
  get hasEvents(): boolean { return this._events.length > 0 }


  /** 
   * Create a Lonely Lobster application event 
   * @param at - Location in the application where the event happened
   * @param moreContext - More contect e.g. values that help to document the event better
   * @param typeId - Type of event
   * @param sev - Event severity
   * @param desc - Optional detail description of the event  
   * @returns a Lonely Lobster application event   
   */
  static applicationEventFrom(at: string, moreContext: string, typeId: EventTypeId, sev: EventSeverity, desc?: string): ApplicationEvent {
    return {
        dateAndtime:    new Date(),
        source:         "frontend",
        sourceVersion:  environment.version,
        severity:       sev,
        typeId:         typeId,
        description:    desc ? desc : typeId.toString(),  // use detail description or if not available then standard text of event type
        context:        `${at}: ${moreContext}`
    }
  }

  /** 
   * Select the Material Design icon and its display color dependent on the event severity   
   * @param sev - event severity
   * @returns the Material Design icon and its display color
   */
  static materialIconAndCssStyle(sev: EventSeverity): MaterialIconAndCssStyle {
    switch (sev) {
      case EventSeverity.info:      return { materialIcon: "info",            cssStyle: "color: green" } 
      case EventSeverity.warning:   return { materialIcon: "warning",         cssStyle: "color: orange" }  
      case EventSeverity.critical:  return { materialIcon: "error",           cssStyle: "color: red" }  
      case EventSeverity.fatal:     return { materialIcon: "brightness_alert",cssStyle: "color: red" }
      default:                      return { materialIcon: "contact_support", cssStyle: "color: purple" }
    } 
  }

  // /** 
  //  * Create string output from the list of events    
  //  * @returns the list of events as string 
  //  */
  // public stringified(): string { 
  //   return this._events.map(ae => `${ae.dateAndtime} ${ae.typeId} ${ae.source} ${ae.sourceVersion} ${ae.severity} ${ae.context}: ${ae.description}`)
  //                      .reduce((s1, s2) => s1 + "\n" + s2)
  // } 
}


 