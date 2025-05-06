import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowArrowComponent } from './flow-arrow.component';

describe('FlowArrowComponent', () => {
  let component: FlowArrowComponent;
  let fixture: ComponentFixture<FlowArrowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlowArrowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowArrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
