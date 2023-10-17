import { Component, OnInit, Input } from '@angular/core'
import { WorkerWithUtilization } from '../shared/io_api_definitions'

@Component({
  selector: 'app-worker-strain',
  templateUrl: './worker-strain.component.html',
  styleUrls: ['./worker-strain.component.css']
})
export class WorkerStrainComponent implements OnInit {
  @Input() woUtil: WorkerWithUtilization

  constructor() { }

  ngOnInit(): void { }

}
