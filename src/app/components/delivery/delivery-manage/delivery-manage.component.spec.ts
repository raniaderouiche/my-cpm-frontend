import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryManageComponent } from './delivery-manage.component';

describe('DeliveryManageComponent', () => {
  let component: DeliveryManageComponent;
  let fixture: ComponentFixture<DeliveryManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliveryManageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
