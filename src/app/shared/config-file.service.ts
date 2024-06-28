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
// read system config file  
// ---------------------------------------------------------------------------------------
  
  public filename:         string = ""
  public fileContent:      string
  private _objFromJsonFile: any 

  set objFromJsonFile(objFromJsonFile: any) {
    this._objFromJsonFile = objFromJsonFile 
    console.log(`config-file.service: set objFromJsonFile(): this._objFromJsonFile=`)
    console.log(this._objFromJsonFile)
  }

  get objFromJsonFile(): any {
    return this._objFromJsonFile
  }


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

}
