//-------------------------------------------------------------------
// EDITOR-MESSAGES COMPONENT
//-------------------------------------------------------------------
// last code cleaning: 21.12.2024

import { Component, OnInit, Input } from '@angular/core'
import { AbstractControl } from "@angular/forms"

/**
 * @class This Angular component renders validation messages in the system configuration editor. 
 */
@Component({
  selector: 'app-editor-messages',
  templateUrl: './editor-messages.component.html',
  styleUrls: ['./editor-messages.component.css']
})
export class EditorMessagesComponent implements OnInit {
  @Input() control:     AbstractControl
/*   @Input() controlName: string 

  private allMessages: Record<string, Record<string, string>> = {
    id: {
      required: "Id must not be empty",
      idContainsPeriod: "Value-chain and process-step IDs must not have a period in their name"
    },
    workerAssignments: {
      duplicates: "An assignment cannot be selected more than once for a worker",
      empty: "Assignment must not be empty"
    },
    common: {
      noInteger: "No decimals allowed",
      negative:  "Number must be positive",
    }
  } */
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
    if (!this.control || !this.control.errors || !this.control.dirty) { return [] }
    return Object.values(this.control.errors).map(err => err.message)
  }
}
