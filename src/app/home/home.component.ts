import { Component, OnInit } from '@angular/core';
import { ConfigFileService } from '../shared/config-file.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from "rxjs"

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  filename: string

  public showEditRunSaveOptions = false


  constructor(private cfs:    ConfigFileService,
              private router: Router,
              private route:  ActivatedRoute) { }

  ngOnInit(): void { }
/**
  get configObject() {
    return this.cfs.configObject
  }

  get configAsJson() {
    return this.cfs.configAsJson
  }
 */

  public createNewConfig() {
    this.cfs.configObject = undefined
    this.router.navigate(["edit"], { relativeTo: this.route })
  }

  public onFileSelected(e: any) { 
    const file: File = e.target.files[0] 
    this.filename = file.name
//  console.log(`app: onFileSelected(): filename=${this.filename}; subscribing to observable ...`)
    const obs$ = this.readFileContentObs(file)
    obs$.subscribe((fileContent: string) => { 
      this.cfs.configAsJson = fileContent
      this.cfs.configObject = JSON.parse(fileContent) 
      this.showEditRunSaveOptions = true
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
      reader.onerror = (error) => subscriber.error(error)
      reader.readAsText(file)
    })
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
