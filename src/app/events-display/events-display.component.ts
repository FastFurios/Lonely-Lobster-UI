import { Component } from '@angular/core';
import { ApplicationEvent, EventSeverity } from '../shared/io_api_definitions';
import { EventsService, MaterialIconAndColor } from '../shared/events.service';


@Component({
  selector: 'app-events-display',
  templateUrl: './events-display.component.html',
  styleUrl: './events-display.component.css'
})
export class EventsDisplayComponent {
    public showingEventsReport:boolean = false

    constructor(private ess: EventsService) { }

    get events(): ApplicationEvent[] {
        return [...this.ess.events].sort((a: ApplicationEvent, b:ApplicationEvent) => b.dateAndtime.getMilliseconds() - a.dateAndtime.getMilliseconds())
    }
    
    public materialIconAndCssStyle(sev: EventSeverity): MaterialIconAndColor { return EventsService.materialIconAndCssStyle(sev) }

}
