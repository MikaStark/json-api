import { TestBed } from '@angular/core/testing';

import { JsonApiInterceptorService } from './json-api-interceptor.service';

describe('JsonApiInterceptorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JsonApiInterceptorService = TestBed.get(JsonApiInterceptorService);
    expect(service).toBeTruthy();
  });
});
