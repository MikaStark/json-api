import { TestBed } from '@angular/core/testing';

import { JsonApiParametersService } from './json-api-parameters.service';

describe('JsonApiParametersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JsonApiParametersService = TestBed.get(JsonApiParametersService);
    expect(service).toBeTruthy();
  });
});
