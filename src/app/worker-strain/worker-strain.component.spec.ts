import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerStrainComponent } from './worker-strain.component';

describe('WorkerStrainComponent', () => {
  let component: WorkerStrainComponent;
  let fixture: ComponentFixture<WorkerStrainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerStrainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkerStrainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
