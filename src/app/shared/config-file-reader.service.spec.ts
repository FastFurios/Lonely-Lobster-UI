import { TestBed } from '@angular/core/testing';

import { ConfigFileReaderService } from './config-file-reader.service';

describe('ConfigFileReaderService', () => {
  let service: ConfigFileReaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigFileReaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
