import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs'

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

  ngOnInit(): void { }

// --- communicating with childs ---  

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


// --- reading local files ---  

  filename: string = ""
  firstname: string = "- empty -"
  lastname: string = "- empty -"
//  sysConfigJsonContent: string
  objFromJsonFile: any 

  /* async */ onFileSelected(e: any) { 
    const file: File = e.target.files[0] 
    this.filename = file.name
    let fileContent: string

/*
    // Promise async -await way of doing it
    try {
      fileContent = await this.readFileContent(file)
    }     
    catch (e: any) {
      switch (e.code) {
          case "ENOENT" : { throw new Error("System parameter file not found: " + e) }
          default       : { throw new Error("System parameter file: other error: " + e.message) }
      }   
    } 
    finally {}
*/

    // Observable way of doing it
    const obs$ = this.readFileContentObs(file)
    obs$.subscribe((fileContent: string) => {
      this.objFromJsonFile = JSON.parse(fileContent) 
      this.firstname = this.objFromJsonFile.firstname
      this.lastname  = this.objFromJsonFile.lastname
      console.log("Content=")
      console.log(this.objFromJsonFile)
    })
  }


  // -- version with Observable -- 

  readFileContentObs(file: File): Observable<string> {
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

/*
  // -- version with Promise -- 
  readFileContent(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (!file) reject("no file selected")
        if (file.size == 0) reject("selected file is empty")

        const reader = new FileReader()
        reader.onload = (e) => {
          if (!reader.result) reject("no result from reading")
          else resolve(reader.result.toString())
        }
        reader.onerror = (error) => {
          reject(error);
        }

        reader.readAsText(file)
    })
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
  7. <input type="file" ...> lets you choose a file via Explorer. The file's content is then made available in the 
     event and can be read with a Reader Object.  



*/
