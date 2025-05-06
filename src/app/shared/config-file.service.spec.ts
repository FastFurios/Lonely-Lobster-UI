import { TestBed } from '@angular/core/testing';

import { ConfigFileService } from './config-file.service';

describe('ConfigFileService', () => {
  let service: ConfigFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
