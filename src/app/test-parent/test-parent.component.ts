import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from "rxjs"
import { readFile } from 'fs';

@Component({
  selector: 'app-test-parent',
  templateUrl: './test-parent.component.html',
  styleUrls: ['./test-parent.component.css']
})
export class TestParentComponent implements OnInit {

  //counter: number
  complexObject = {
    someText: "I'm your father!",
    someBoolean: true,
    counters: [-1, -1, -1]
  }


  constructor() {
    //this.counter = 0 
    this.complexObject.counters[0] = 0
  }

  ngOnInit(): void {
  }
  
  ngOnChanges(): void {
    console.log("TestParentComponent.ngOnChnages()")
  }


  clickHandler(): void {
    //this.counter++
    this.complexObject.counters[0]++
  }

  syncCounters(childCounter: number) {
    //this.counter = childCounter
    this.complexObject.counters[0] = childCounter
  }

  filename: string = ""
  sysConfigJsonContent: string
  objFromJsonFile: any 

  async onFileSelected(e: any) { 
//  this.filename = this.filename.substring(this.filename.lastIndexOf('\\') + 1)

    console.log("TestParentComponent.onFileSelected(e) this.filename=")
    console.log(this.filename)


    const file: File = e.target.files[0] 
    const url = URL.createObjectURL(file)

    console.log("TestParentComponent.onFileSelected(e) e:Event=")
    console.log(file)

    this.filename = file.name
    console.log("TestParentComponent.onFileSelected(e) this.filename=")
    console.log(this.filename)
    console.log("TestParentComponent.onFileSelected(e) url=")
    console.log(url)
    console.log("TestParentComponent.onFileSelected(e) webkitrelativepath=")
    console.log(file.webkitRelativePath)
    console.log("TestParentComponent.onFileSelected(e) size=")
    console.log(file.size)


    const fileContent = await this.readFileContent(e.target.files[0]);
    console.log("TestParentComponent.onFileSelected(e) fileContent=")
    console.log(">>" + fileContent + "<<")

    this.objFromJsonFile = JSON.parse(fileContent) 
    console.log("TestParentComponent.onFileSelected(e) objFromJsonFile=")
    console.log(this.objFromJsonFile)

  }

  readFileContent(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (!file) {
            resolve('empty');
        }

        const reader = new FileReader();

        reader.onload = (e) => {
          if (reader.error) resolve("ERROR" + reader.error)
          //if (!reader.result) resolve("ERROR- no result")
          const text = reader.result!.toString();
            resolve(text);
        };
        reader.onerror = (error) => {
          console.log("reader.onerror=" + error);
        }
        reader.readAsText(file) //, 'UTF-8');
    });
  }



  readJsonFile(file: File) {
    let fileReader = new FileReader();
    fileReader.onloadend = () => {
      console.log("TestParentComponent.readJsonFile-Handler(" + file.name + ") fileReader.result=")
      console.log(fileReader.result ? "defined" : "undefined");
      console.log("TestParentComponent.readJsonFile-Handler(" + file.name + ") After")

    }
    console.log("TestParentComponent.fileReader.readAsText(" + file.name + ")")
    fileReader.readAsText(file);
  }
/*
    this.cfr.getJsonFile(this.filename).subscribe(data => {
      console.log("SystemComponent.onFileSelected(): filename = " + this.filename)
      this.sysConfigJsonContent = data
      console.log("SystemComponent.onFileSelected(): cfr.sysConfigJson =")
      console.log(this.sysConfigJsonContent)
    })

  }
*/
 /*     // read system parameter JSON file
  readSystemConfigFile(filename : string) : void {
    // read system parameter JSON file
      let paramsAsString : string = ""
      try { paramsAsString  = readFileSync(filename, "utf8") } 
      catch (e: any) {
          switch (e.code) {
              case "ENOENT" : { throw new Error("System parameter file not found: " + e) }
              default       : { throw new Error("System parameter file: other error: " + e.message) }
          }   
      } 
      finally {}
  
      const paj = JSON.parse(paramsAsString)  // "paj" = parameters as JSON 
      console.log("SystemComponent.readSystemConfigFile(" + filename + ")=")
      console.log(paj)

    // https://blog.angular-university.io/angular-file-upload/
//    if (!event.target.files[0]) return 

    const file:File = event[target].files[0]

    if (file) {

        this.fileName = file.name;

        const formData = new FormData();

        formData.append("thumbnail", file);

        const upload$ = this.http.post("/api/thumbnail-upload", formData);

        upload$.subscribe();
    }

  }
  */

}

/*
  Findings:

  @Input und @Output
  1. changes in a parent object that is bound via @Input() to an attribute in the child are instantenously propagated to the child.
    When incrementing the parent counter (even when it is not a primitive but deeper burried as an property of an object) the change is visible in the child.
  2. changes to the child counter which is bound to the parent counter are NOT propagated back to the parent. 
    The solution to back-propagate child changes is to instantiate an EventEmitter in the child and make it visible via @Output() to the parent template.
    In the parent template this EventEmitter is bound to a handler method of the parent component which handles the change from the child, e.g. by setting the parent's to the child's counter value.   
  3. When the value of an @Input() attribute in the child gets changed by the parent the child component is NOT re-initialized, i.e. ngOnInit() is NOT called.
  4. Whenever the value of an @Input() attribute in the child gets changed by the parent the child's ngOnChanges() method is called.
  5. When the child back-propagates a value via @Output() and and an EventEmitter, see above, the ngOnChanges() in the parent is NOT called. No need, since we have an explicitly implemented handler method anyway. 

  <input ...>
  6. Dealing with <input> fields in the child's template: <input ... onchange="inputHandler($event)"> does not work: runtime error "inputHandler is not defined at HTMLInputyElement.onchange" 

*/
