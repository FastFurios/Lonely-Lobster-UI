import { Component, Input } from '@angular/core';
import { ApplicationEvent, EventSeverity } from '../shared/io_api_definitions';
import { EventsService, MaterialIconAndColor } from '../shared/events.service';


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

    public materialIconAndCssStyle(sev: EventSeverity): MaterialIconAndColor { return EventsService.materialIconAndCssStyle(sev) }

}
