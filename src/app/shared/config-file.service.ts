import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Observable, throwError } from "rxjs"
import { BehaviorSubject } from 'rx'

const sysConfigsPath = "http://localhost:8080/"

@Injectable({
  providedIn: 'root'
})
export class ConfigFileService {

  constructor(private http: HttpClient) { }

// ---------------------------------------------------------------------------------------
// set and get system config file in JSON file format  
// ---------------------------------------------------------------------------------------
  
  public filename:         string = ""
  public fileContent:      string
  private _configObject:   any 
  private _configAsJson:   any
  private componentEventSubject          = new BehaviorSubject<string>("")
  public  componentEventSubject$         = this.componentEventSubject.asObservable()

  set configObject(configObject: any) {
    this._configObject = configObject 
//    console.log(`config-file.service: set objFromJsonFile(): this._objFromJsonFile=`)
//    console.log(this._configObject)
  }

  get configObject(): any {
    return this._configObject
  }

  get configAsJson(): any {
    return this._configAsJson
  }

  set componentEvent(compEvent: string) {
    this.componentEventSubject.onNext(compEvent)
  }

}
