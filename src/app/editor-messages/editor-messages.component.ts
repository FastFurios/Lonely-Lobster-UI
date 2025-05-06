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
  ngOnInit(): void { 
     //console.log(`------ EditorMessages: ngInit(): @Input control is defined = ${this.control ? "yes" : "no"}; it is invalid = ${this.control?.invalid}; it is enabled = ${this.control?.enabled} -------------------------`)
  }

  // ---------------------------------------------------------------------------------------
  // list of validation errors 
  // ---------------------------------------------------------------------------------------

  /**
   * Lists validation messages for a control if not null i.e. deemed OK by the validators 
   * @returns Validation messages
   */
  public errorsForControl(): string[] {
    return this.getErrorsAsArray(this.control).filter(err => err.key != "required").map(err => `${err.key == "required" ? err.value : err.value.message}`)
  }

  /**
   * List of validation error message of the control 
   * @returns Validation messages as array of key-value-pair objects
   */
  private getErrorsAsArray(control: AbstractControl): { key: string; value: any }[] {
    if (!control.errors) return []
    return Object.keys(control.errors).map(key => ({
      key,
      value: control.errors![key]
    }))
  }
}
