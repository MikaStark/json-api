import { TestBed } from '@angular/core/testing';

import { JsonApiBuilderService } from './json-api-builder.service';

describe('JsonApiBuilderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JsonApiBuilderService = TestBed.get(JsonApiBuilderService);
    expect(service).toBeTruthy();
  });
});
