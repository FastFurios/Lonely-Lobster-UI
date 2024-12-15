import { Component } from '@angular/core';
import { ApplicationEvent, EventSeverity } from '../shared/io_api_definitions';
import { EventsService, MaterialIconAndCssStyle } from '../shared/events.service';


@Component({
  selector: 'app-events-display',
  templateUrl: './events-display.component.html',
  styleUrl: './events-display.component.css'
})
export class EventsDisplayComponent {
    public showingEventsReport:boolean = false

    constructor(private ess: EventsService) { }

    get events(): ApplicationEvent[] {
        return [...this.ess.events].sort((a: ApplicationEvent, b:ApplicationEvent) => b.dateAndtime > a.dateAndtime ? 1 : -1)
    }
    
    public materialIconAndCssStyle(sev: EventSeverity): MaterialIconAndCssStyle { return EventsService.materialIconAndCssStyle(sev) }

}
