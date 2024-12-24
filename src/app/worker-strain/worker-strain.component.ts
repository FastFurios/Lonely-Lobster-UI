//-------------------------------------------------------------------
// WORKER STRAIN COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 22.12.2024

import { Component, OnInit, Input } from '@angular/core'
import { WorkerWithUtilization } from '../shared/frontend_definitions'

/**
 * @class This Angular class renders the worker's name with the background color set according his/her utilization
 */
@Component({
  selector: 'app-worker-strain',
  templateUrl: './worker-strain.component.html',
  styleUrls: ['./worker-strain.component.css']
})
export class WorkerStrainComponent implements OnInit {
  @Input() woUtil: WorkerWithUtilization

  /** @private */
  constructor() { }
  /** @private */
  ngOnInit(): void { }
}
