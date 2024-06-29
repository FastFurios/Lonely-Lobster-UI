import { Component } from '@angular/core';
import { Observable, catchError, throwError } from "rxjs"
import { ConfigFileService } from './shared/config-file.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'lonely-lobster'
  filename: string
  public editNew  = false

  constructor(private cfs: ConfigFileService) { }

  public onFileSelected(e: any) { 
    const file: File = e.target.files[0] 
    this.filename = file.name
//  console.log(`app: onFileSelected(): filename=${this.filename}; subscribing to observable ...`)
    const obs$ = this.readFileContentObs(file)
    obs$.subscribe((fileContent: string) => { 
      this.cfs.configAsJson = fileContent
      this.cfs.configObject = JSON.parse(fileContent) 
//    console.log(`config-file.service: readFileContent(): subscriber:  this.objFromJsonFile=`)
//    console.log(this.cfs.objFromJsonFile)
    })
  }

  private readFileContentObs(file: File): Observable<string> {
    return new Observable((subscriber) => {
      if (!file) subscriber.error("no file selected")
      if (file.size == 0) subscriber.error("selected file is empty")

      const reader = new FileReader()
      reader.onload = (e) => {
        if (!reader.result) subscriber.error("no result from reading")
        else subscriber.next(reader.result.toString())
      }
      reader.onerror = (error) => {
        subscriber.error(error);
      }
      reader.readAsText(file)
    })
  }

  get configObject() {
    return this.cfs.configObject
  }

  get configAsJson() {
    return this.cfs.configAsJson
  }

  public editNewConfig() {
    this.cfs.configObject = undefined
  }

  public onSaveFile(): void {
    //  let fileContent = "Hi there, I was just saved from the Angular app!"
        const fileContent = this.cfs.configObject
        const file = new Blob([JSON.stringify(fileContent, null, "\t")], { type: "application/json" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(file)
        link.download = this.filename
        console.log("system.onSaveFile(): saving to " + link.download)
        link.click()
        link.remove()
      }
    
    



}


/* work

Aufruf Lonely Lobster
Options:
=> load => file selection and load 
  => edit (pre-filled)
    => save
      => download
      => run
  => run
=> edit (new) 
    => save
      => download
      => run


(start) => Screen: "load or new"
"load or new" + load => edit (pre-filled)
"load or new" + new  => edit (empty)
edit X + save => save into cfs
edit X + download => download into file system
edit X && saved to cfs + run => run
run && saved to cfs + edit => edit (pre-filled) 
run && not saved to cfs + edit => edit (empty) 
*/