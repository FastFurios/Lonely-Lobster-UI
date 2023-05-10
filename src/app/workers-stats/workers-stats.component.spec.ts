import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkersStatsComponent } from './workers-stats.component';

describe('WorkersStatsComponent', () => {
  let component: WorkersStatsComponent;
  let fixture: ComponentFixture<WorkersStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkersStatsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkersStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
