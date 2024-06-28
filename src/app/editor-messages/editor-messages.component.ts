import { Component, OnInit, Input } from '@angular/core'
import { AbstractControl } from "@angular/forms"

@Component({
  selector: 'app-editor-messages',
  templateUrl: './editor-messages.component.html',
  styleUrls: ['./editor-messages.component.css']
})
export class EditorMessagesComponent implements OnInit {
  @Input() control:     AbstractControl
  @Input() controlName: string 

  private allMessages: Record<string, Record<string, string>> = {
    id: {
      required: "id must not be empty",
      idWithoutPeriod: "Value-chain and process-step IDs must not have a period in their name"
    },
    workerAssignments: {
      duplicates: "An assignment connot be selected more than once for a worker",
      empty: "assignment must not be empty"
    }
}

constructor() { }

  ngOnInit(): void { }

  // ---------------------------------------------------------------------------------------
  // validators
  // ---------------------------------------------------------------------------------------

  public errorsForControl(): string[] {
    if (this.controlName == "workerAssignment") {
      //console.log("Editor-message.errorsForControl(): this.control.get(vcIdpsId).value = >" + this.control.get("vcIdpsId")?.value + "<")
    }
    const messages = this.allMessages[this.controlName]
    if (!this.control || !this.control.errors || !messages || !this.control.dirty) { return [] }
    return Object.keys(this.control.errors).map(err => messages[err])
  }
}
