import { Component, OnInit, Input } from '@angular/core';
import { I_ProcessStep } from '../shared/api-definitions'

@Component({
  selector: 'app-process-step',
  templateUrl: './process-step.component.html',
  styleUrls: ['./process-step.component.css']
})
export class ProcessStepComponent implements OnInit {
  @Input() ps: I_ProcessStep
  constructor() { }

  ngOnInit(): void {
  }

}
