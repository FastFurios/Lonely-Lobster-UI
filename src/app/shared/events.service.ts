import { Injectable } from '@angular/core'
import { environment } from '../../environments/environment'
import { EventTypeId, EventSeverity, ApplicationEvent } from './io_api_definitions'
  

export type MaterialIconAndColor = {
    materialIcon: string
    cssStyle:     string
}


@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private _events: ApplicationEvent[] = []

  constructor() { }

  public add(appEvent: ApplicationEvent): void { 
    this._events.push(appEvent) 
//  this._events.sort((a, b) => b.dateAndtime.getMilliseconds() - a.dateAndtime.getMilliseconds())
    console.log("Events service: added event: resulting list = ")
    console.log(this.stringified()) 
  }

  get events(): ApplicationEvent[] { return this._events }

  get hasEvents(): boolean { return this._events.length > 0 }


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

  static materialIconAndCssStyle(sev: EventSeverity): MaterialIconAndColor {
    switch (sev) {
      case EventSeverity.info:      return { materialIcon: "info",            cssStyle: "color: green" } 
      case EventSeverity.warning:   return { materialIcon: "warning",         cssStyle: "color: orange" }  
      case EventSeverity.critical:  return { materialIcon: "error",           cssStyle: "color: red" }  
      case EventSeverity.fatal:     return { materialIcon: "brightness_alert",cssStyle: "color: red" }
      default:                      return { materialIcon: "contact_support", cssStyle: "color: purple" }
    } 
  }

  public stringified(): string { 
    return this._events.map(ae => `${ae.dateAndtime} ${ae.typeId} ${ae.source} ${ae.sourceVersion} ${ae.severity} ${ae.context}: ${ae.description}`)
                       .reduce((s1, s2) => s1 + "\n" + s2)
  } 

}


 