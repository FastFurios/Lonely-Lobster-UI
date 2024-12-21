//-------------------------------------------------------------------
// HOME COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 21.12.2024
import { Component, OnInit } from '@angular/core'
import { ConfigFileService } from '../shared/config-file.service'
import { I_ValueChainAsJson }      from '../shared/io_api_definitions'    

/**
 * @class This Angular component provides the hme page of the Lonely-Lobster application. 
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  /**
   * @private
   */
  constructor(private cfs: ConfigFileService) { }
  /**
   * @private
   */
  ngOnInit(): void { }

  /**
   * System configuration getter for use in html template
   */
  get configAsJson() {
    return this.cfs.configAsJson
  }

  /**
   * Calculate the number of all process steps in the system
   */
  get numSystemProcessSteps() {
    return this.cfs.configAsJson()?.value_chains.reduce((sum: number, vc: I_ValueChainAsJson) => sum + vc.process_steps.length, 0)
  }
}
