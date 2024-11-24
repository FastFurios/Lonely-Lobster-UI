import { Injectable } from '@angular/core'
import { ApplicationEvent } from './io_api_definitions'


@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private _events: ApplicationEvent[] = []

  constructor() { }

  public add(appEvent: ApplicationEvent): void { 
    this._events.push(appEvent) 
    console.log("Events service: added event: resulting list = ")
    console.log(this.stringified())
  }

  get events(): ApplicationEvent[] { return this._events }

  get hasEvents(): boolean { return this._events.length > 0 }

  public stringified(): string { 
    return this._events.map(ae => `${ae.dateAndtime} ${ae.typeId} ${ae.source} ${ae.sourceVersion} ${ae.severity} ${ae.context}: ${ae.description}`)
                       .reduce((s1, s2) => s1 + "\n" + s2)
  } 

}


 