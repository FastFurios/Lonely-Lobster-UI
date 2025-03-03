//**************************************************************************
// just a test bed for testing some techniques in Angular; 
// is not part of the Lonely-Lobster application 
//**************************************************************************

import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-test-child',
  templateUrl: './test-child.component.html',
  styleUrls: ['./test-child.component.css']
})
export class TestChildComponent implements OnInit {

  @Input() childCounter: { id: string, val: number }
  //@Output() submitChildCounter = new EventEmitter<number>()

//  changeCount: number = 0
//  inputTextField: string =""

  constructor() {     
    console.log("Test-Child: constructor()")
  }

  ngOnInit(): void {
    console.log("Test-Child.ngOnInit(): id = " + this.childCounter.id)
  }

  ngOnChanges(): void {
//  console.log("Test-Child.ngOnChanges(): id = " + this.childCounter.id)
  }

  clickHandler(): void {
    this.childCounter.val++
  }
/*
  numberInputHandler(e: Event) {
    console.log("TestChildComponent.numberInputHandler(e):" )
    //console.log(e)
  }

  textInputHandler(e: Event) {
    console.log("TestChildComponent.textInputHandler(e):" )
    //console.log(e)

    this.changeCount++
  }

  submit() {
    console.log("TestChildComponent.submit()")
    this.submitChildCounter.emit(this.childCounter.val)
  }
*/
}
