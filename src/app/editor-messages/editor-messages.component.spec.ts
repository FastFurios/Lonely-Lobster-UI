import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorMessagesComponent } from './editor-messages.component';

describe('EditorMessagesComponent', () => {
  let component: EditorMessagesComponent;
  let fixture: ComponentFixture<EditorMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditorMessagesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
