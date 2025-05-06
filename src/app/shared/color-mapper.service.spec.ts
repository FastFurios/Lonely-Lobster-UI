import { TestBed } from '@angular/core/testing';

import { ColorMapperService } from './color-mapper.service';

describe('ColorMapperService', () => {
  let service: ColorMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorMapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
