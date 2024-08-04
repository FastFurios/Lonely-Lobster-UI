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
  public filename               = ""
  public showEditRunSaveOptions = false

  constructor(private cfs:    ConfigFileService,
              private router: Router,
              private route:  ActivatedRoute) { }

  ngOnInit(): void { }

  get configAsPojo() {
    return this.cfs.configAsPojo
  }

  get numSystemProcessSteps() {
    return this.configAsPojo?.valueChains.reduce((sum: number, vc: any) => sum + vc.process_steps.length, 0)
  }

  public createNewConfig() {
    this.cfs.configAsPojo = undefined
  }

  public onFileSelected(e: any) { 
    const file: File = e.target.files[0] 
    this.filename = file.name
    const obs$ = this.readFileContentObs(file)
    obs$.subscribe((fileContent: string) => { 
      //this.cfs.configAsJson = fileContent
      this.cfs.configAsPojo = JSON.parse(fileContent) 
      this.router.navigate(["../edit"], { relativeTo: this.route })
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
    const fileContent = this.cfs.configAsPojo
    const file = new Blob([JSON.stringify(fileContent, null, "\t")], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(file)
    link.download = this.filename
    console.log("system.onSaveFile(): saving to " + link.download)
    link.click()
    link.remove()
  }
}
