import { TestBed } from '@angular/core/testing';

import { WorkitemsInventoryService } from './workitems-inventory.service';

describe('WorkitemsInventoryService', () => {
  let service: WorkitemsInventoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkitemsInventoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
