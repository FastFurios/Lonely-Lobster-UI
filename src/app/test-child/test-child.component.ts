import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-test-child',
  templateUrl: './test-child.component.html',
  styleUrls: ['./test-child.component.css']
})
export class TestChildComponent implements OnInit {

  @Input() childCounter: number
  @Output() submitChildCounter = new EventEmitter<number>()

  changeCount: number = 0
  inputTextField: string =""

  constructor() { }

  ngOnInit(): void {
    console.log("TestChildComponent.ngOnInit()")
  }

  ngOnChanges(): void {
    console.log("TestChildComponent.ngOnChnages()")
  }

  clickHandler(): void {
    this.childCounter++
  }

  numberInputHandler(e: Event) {
    console.log("TestChildComponent.numberInputHandler(e):" )
    //console.log(e)
  }

  textInputHandler(e: Event) {
    console.log("TestChildComponent.inputHandler(e):" )
    //console.log(e)

    this.changeCount++
  }

  submit() {
    console.log("TestChildComponent.submit()")
    this.submitChildCounter.emit(this.childCounter)
  }

}
