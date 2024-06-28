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

  constructor(private cfs: ConfigFileService) { }

  public onFileSelected(e: any) { 
    const file: File = e.target.files[0] 
    this.filename = file.name
    console.log(`app: onFileSelected(): filename=${this.filename}; subscribing to observable ...`)
    const obs$ = this.readFileContentObs(file)
    obs$.subscribe((fileContent: string) => { 
      this.cfs.objFromJsonFile = JSON.parse(fileContent) 
      console.log(`config-file.service: readFileContent(): subscriber:  this.objFromJsonFile=`)
      console.log(this.cfs.objFromJsonFile)

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

  get objFromJsonFile() {
    return this.cfs.objFromJsonFile
  }
}
