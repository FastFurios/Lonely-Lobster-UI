//-------------------------------------------------------------------
// CONFIGURATION FILE SERVICE
//-------------------------------------------------------------------
// last code cleaning: 14.12.2024

import { Injectable } from '@angular/core'
import { I_ConfigAsJson } from './io_api_definitions'
 
/**
 * @class Stores a system configuration as a POJO (plain old javascript object) with the structure of a system confuration JSON file and provides it to other frontend components 
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigFileService {
  private _configAsJson:   I_ConfigAsJson | undefined

  constructor() { }
  /** 
   * get the currently stored configuration 
   * @returns the currently stored configuration   
   */
  configAsJson(): I_ConfigAsJson | undefined {
    return this._configAsJson
  }

   /** 
   * Stores a new system configuration in this service and emits a component event
   * @param configJson - system configuration in parsed JSON form, i.e. a POJO  
   */
  storeConfigAsJson(configJson: I_ConfigAsJson | undefined): void {
    this._configAsJson = configJson 
  }

   /** 
   * Deletes the system configuration in this service 
   * @param configJson - emits an discarding event   
   */
   discardConfigAsJson(): void {
    this._configAsJson = undefined 
  }
}
