import { TestBed } from '@angular/core/testing';

import { WorkorderFeederService } from './workorder-feeder.service';

describe('WorkorderFeederService', () => {
  let service: WorkorderFeederService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkorderFeederService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
