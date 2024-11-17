import { Component, Input } from '@angular/core';
import { ApplicationEvent } from '../shared/io_api_definitions';

@Component({
  selector: 'app-events-display',
  templateUrl: './events-display.component.html',
  styleUrl: './events-display.component.css'
})
export class EventsDisplayComponent {
    @Input() events: ApplicationEvent[] = []

    constructor() { }
}
