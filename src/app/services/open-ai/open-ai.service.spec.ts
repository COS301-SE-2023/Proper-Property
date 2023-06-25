import { TestBed } from '@angular/core/testing';

import { OpenAIService } from './open-ai.service';

describe('OpenAIService', () => {
  let service: OpenAIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenAIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
