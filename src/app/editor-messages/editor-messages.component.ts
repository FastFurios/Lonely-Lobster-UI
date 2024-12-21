//-------------------------------------------------------------------
// EDITOR-MESSAGES COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 21.12.2024

import { Component, OnInit, Input } from '@angular/core'
import { AbstractControl } from "@angular/forms"

/**
 * @class This Angular component renderes validation messages in the system configuration editor. 
 */
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
  /** @private  */
  constructor() { }
  /** @private  */
  ngOnInit(): void { }

  // ---------------------------------------------------------------------------------------
  // validators
  // ---------------------------------------------------------------------------------------

  /**
   * Validation messages for a control and its current value 
   * @returns Validation message
   */
  public errorsForControl(): string[] {
    const messages = this.allMessages[this.controlName]
    if (!this.control || !this.control.errors || !messages || !this.control.dirty) { return [] }
    return Object.keys(this.control.errors).map(err => messages[err])
  }
}
