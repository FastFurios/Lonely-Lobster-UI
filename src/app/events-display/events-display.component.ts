import { Component, Input } from '@angular/core';
import { ApplicationEvent, EventSeverity } from '../shared/io_api_definitions';
import { EventsService } from '../shared/events.service';


@Component({
  selector: 'app-events-display',
  templateUrl: './events-display.component.html',
  styleUrl: './events-display.component.css'
})
export class EventsDisplayComponent {
//  @Input() events: ApplicationEvent[] = []
    public showingEventsReport:boolean = false

    constructor(private ess: EventsService) { }

    get events(): ApplicationEvent[] {
        console.log("EventsDisplayComponent: get events(): returning:")
        console.log(this.ess.events.sort((a, b) => a.dateAndtime.getMilliseconds > b.dateAndtime.getMilliseconds ? -1 : 1))
        return this.ess.events.sort((a, b) => a.dateAndtime.getMilliseconds > b.dateAndtime.getMilliseconds ? -1 : 1)
    }

    public materialIcon(sev: EventSeverity): string {
        switch (sev) {
          case EventSeverity.info:      return "info"
          case EventSeverity.warning:   return "warning"
          case EventSeverity.critical:  return "error"
          case EventSeverity.fatal:     return "brightness_alert"
          default:                      return "contact_support"
        } 
    }


    // public toggleEventsReport(): void {
    //     this.showingEventsReport = !this.showingEventsReport
    // }
}
