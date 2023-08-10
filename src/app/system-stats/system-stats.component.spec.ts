import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemStatsComponent } from './system-stats.component';

describe('SystemStatsComponent', () => {
  let component: SystemStatsComponent;
  let fixture: ComponentFixture<SystemStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemStatsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
