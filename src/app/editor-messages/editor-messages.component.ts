import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-editor-messages',
  templateUrl: './editor-messages.component.html',
  styleUrls: ['./editor-messages.component.css']
})
export class EditorMessagesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}


/*
import { Component, OnInit, Input } from '@angular/core';
import { AbstractControl } from "@angular/forms"
import { BookValidators } from '../shared/book-validators';

@Component({
  selector: 'b-form-messages',
  templateUrl: './form-messages.component.html',
  styleUrls: ['./form-messages.component.scss']
})
export class FormMessagesComponent implements OnInit {
  @Input() control:     AbstractControl
  @Input() controlName: string 

  private allMessages: Record<string, Record<string, string>> = {
      title: {
          required: "A book title is missing."
      },
      isbn: {
        required: "The ISBN is missing.",
        isbnFormat: "ISBN needs to habe either 10 or 13 digits.",
        isbnExists: "ISBN already assigned to another existing book."
        //   minlength: "ISBN is too short (10 digits minimum).",
        //   maxlength: "ISBN is too long (13 digits maximum)."
      },
      author: {
        atLeastOneAuthor: "At least one author required...a book doesn't write itself!"
        //   required: "An author is missing."
      },
      published: {
          required: "The publishing date is missing."
      }
  }

  constructor() { }

  ngOnInit(): void { }

  errorsForControl(): string[] {
      const messages = this.allMessages[this.controlName]
      if (!this.control || !this.control.errors || !messages || !this.control.dirty) { return [] }
      return Object.keys(this.control.errors).map(err => messages[err])
  }
}
*/