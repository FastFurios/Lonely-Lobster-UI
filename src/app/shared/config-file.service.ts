import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Observable, throwError } from "rxjs"

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
  private _configObject: any 
  private _configAsJson: any

  set configObject(configObject: any) {
    this._configObject = configObject 
    console.log(`config-file.service: set objFromJsonFile(): this._objFromJsonFile=`)
    console.log(this._configObject)
  }

  get configObject(): any {
    return this._configObject
  }

  set configAsJson(configAsJson: any) {
    this._configAsJson = configAsJson
    console.log(`config-file.service: jsonFileContentFromObj(obj): this._jsonFileContentFromObj=`)
    console.log(this._configAsJson)
  }

  get configAsJson(): any {
    return this._configAsJson
  }


/*
  // ---------------------------------------------------------------------------------------
// write system config file to /downloads  
// ---------------------------------------------------------------------------------------
  
  public onSaveFile(): void {
//  let fileContent = "Hi there, I was just saved from the Angular app!"
    let fileContent = {
      name: "Gerold",
      age: 56
    }
    const file = new Blob([JSON.stringify(fileContent)], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(file)
    link.download = this.filename
    console.log("system.onSaveFile(): saving to " + link.download)
    link.click()
    link.remove()
  }
*/
}
