import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutputBasketComponent } from './output-basket.component';

describe('OutputBasketComponent', () => {
  let component: OutputBasketComponent;
  let fixture: ComponentFixture<OutputBasketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OutputBasketComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutputBasketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
