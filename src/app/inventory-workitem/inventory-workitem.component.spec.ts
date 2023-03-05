import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryWorkitemComponent } from './inventory-workitem.component';

describe('InventoryWorkitemComponent', () => {
  let component: InventoryWorkitemComponent;
  let fixture: ComponentFixture<InventoryWorkitemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryWorkitemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryWorkitemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
