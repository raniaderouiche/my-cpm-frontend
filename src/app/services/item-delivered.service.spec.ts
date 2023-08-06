import { TestBed } from '@angular/core/testing';

import { ItemDeliveredService } from './item-delivered.service';

describe('ItemDeliveredService', () => {
  let service: ItemDeliveredService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemDeliveredService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
