import { Component, OnInit } from '@angular/core';
import { Observable, throwError } from "rxjs"
//import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from "rxjs/operators"

/*
interface SessionBackendResponse {
  message: string
}
*/

type CollElem = {id: string, val: number}
type ComplexObject = {
  someText: string,
  someBoolean: boolean,
  coll: CollElem[]
}



@Component({
  selector: 'app-test-parent',
  templateUrl: './test-parent.component.html',
  styleUrls: ['./test-parent.component.css']
})
export class TestParentComponent implements OnInit {

  //counter: number
  complexObject: ComplexObject = {
    someText: "I'm your father!",
    someBoolean: true,
    coll: [
      {id: "Zero", val: 0},
      {id: "One", val: 1},
      {id: "Two", val: 2}
    ]
  }

 /* sessions 
  getTextFromMySessionRequest$: Observable<SessionBackendResponse> 
  addTextToMySessionRequest$: Observable<SessionBackendResponse>
  textInMyBackendSession:  string = "- none yet -"
  textToAdd: string
*/

  constructor(private http: HttpClient) {
    console.log("Test-Parent: constructor()")
    //this.counter = 0 
  }

  ngOnInit(): void {
    console.log("Test-Parent: ngOnInit()")
  }

// --- communicating with childs ---  

  ngOnChanges(): void {
//  console.log("Test-Parent: ngOnChanges()")
  }


  clickHandler(elemId: string): void {
    //this.counter++
    //this.complexObject.coll[elemId].val++ // works perfectly, no DOM manipulation when val is changed, as long the object reference to complexObject is unchanged 

    // let's try to make the reference change evry time a value in the object is changed. This simulates e.g. a new data structure update received from the backend  
    this.complexObject.coll = this.complexObject.coll.map(elem => elem.id == elemId ? { id: elem.id, val: elem.val + 1 } : elem)  // w/o any further preparations using "trackBy" in *ngFor, the childCounter object is re-created in the DOM
  }

  public idOfChild(index: number, elem: CollElem): string {
    console.log("Test-Parent: ifOfChild(" + elem.id + ") returns = " + elem.id)
    return elem.id
  }


/*
  syncCounters(childCounter: number) {
    //this.counter = childCounter

    this.complexObject.coll[0].val = childCounter
  }


// --- communicating with a session enabled backend -----

private errorHandler(error: HttpErrorResponse): Observable<any> {
  console.error("errorHandler(): Fehler aufgetreten!" + error.message + error.ok)
  return throwError(() => "error")
}


getFromBackend() {
      console.log("getFromBackend...")
      this.getTextFromMySessionRequest$ = this.http.get<SessionBackendResponse>(
                "http://localhost:8080/test", 
                { withCredentials: true }
                ).pipe(
                  catchError((error: HttpErrorResponse) =>this.errorHandler(error))
                )
      this.getTextFromMySessionRequest$.subscribe((response: SessionBackendResponse) => {
        console.log("subscriber to getTextFromMySessionRequest$: message received= " + response.message)
        this.textInMyBackendSession = response.message
      })                            
}

postToBackend() {
  console.log("postToBackend(" + this.textToAdd + ")...")
  this.addTextToMySessionRequest$ = this.http.post<SessionBackendResponse>(
                "http://localhost:8080/test", 
                { textToAdd : this.textToAdd}, 
                { withCredentials: true }
            ).pipe(
                catchError((error: HttpErrorResponse) =>this.errorHandler(error))
            )
  this.addTextToMySessionRequest$.subscribe((response: SessionBackendResponse) => {
    console.log("subscriber to addTextToMySessionRequest$: message received= " + response.message)
  })                            
}




// --- reading local files ---  

  filename: string = ""
  firstname: string = "- empty -"
  lastname: string = "- empty -"
//  sysConfigJsonContent: string
  objFromJsonFile: any 

 onFileSelected(e: any) { 
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

  On changing @Inputs when is the constructor called, i.e. the old instance is dropped and a new is created, and when not 
  8. When a fixed sub-component is embedded into the parents template w/o *ngFor, no constructor call in child, ngOnit only
  9. However, when multiple childs are under the parent via *ngFor, the constructor is called every time, i.e. the child cannot hold state as it is dropped with every change in the @Input attribute        
  10. when "trackBy:someFunction" is used with *ngFor and a method "someFunction" is defined in the component that returns a an id of the collection's child elements are returned, then Angular recognizes that no dropping and re-constructing of the child is required 



*/
