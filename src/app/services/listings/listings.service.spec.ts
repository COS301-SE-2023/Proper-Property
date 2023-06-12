import { TestBed } from '@angular/core/testing';

import { ListingsService } from './listings.service';

describe('ListingsService', () => {
  let service: ListingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
