//-------------------------------------------------------------------
// EVENTS DISPLAY COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 21.12.2024
import { Component } from '@angular/core';
import { ApplicationEvent, EventSeverity } from '../shared/io_api_definitions';
import { EventsService, MaterialIconAndCssStyle } from '../shared/events.service';

/**
 * @class This Angular component displays the list of application events.
 */
@Component({
  selector: 'app-events-display',
  templateUrl: './events-display.component.html',
  styleUrl: './events-display.component.css'
})
export class EventsDisplayComponent {
    public showingEventsReport:boolean = false

    /** @private */
    constructor(private ess: EventsService) { }

    /** @returns The list of application events */
    get events(): ApplicationEvent[] {
        return [...this.ess.events].sort((a: ApplicationEvent, b:ApplicationEvent) => b.dateAndtime > a.dateAndtime ? 1 : -1)
    }
    
    /**
     * Determine the icon and its style dependent on the event severity 
     * @param sev Event severity
     * @returns Material icon and its CSS style
     */
    public materialIconAndCssStyle(sev: EventSeverity): MaterialIconAndCssStyle { 
        return EventsService.materialIconAndCssStyle(sev) 
    }

}
