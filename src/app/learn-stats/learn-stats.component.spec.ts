import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearnStatsComponent } from './learn-stats.component';

describe('LearnStatsComponent', () => {
  let component: LearnStatsComponent;
  let fixture: ComponentFixture<LearnStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LearnStatsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearnStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
