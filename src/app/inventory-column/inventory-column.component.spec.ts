import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryColumnComponent } from './inventory-column.component';

describe('InventoryColumnComponent', () => {
  let component: InventoryColumnComponent;
  let fixture: ComponentFixture<InventoryColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryColumnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
