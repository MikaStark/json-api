import { TestBed } from '@angular/core/testing';

import { JsonApiService } from './json-api.service';
import { JSON_API_URL } from './json-api-url';
import { HttpClient } from '@angular/common/http';
import { JsonApiParametersService } from './json-api-parameters.service';
import { JsonApiFactoryService } from './json-api-factory.service';

const url = 'http://fake.api.url';

describe('JsonApiService', () => {
  const http = jasmine.createSpy('HttpClient');
  const factory = jasmine.createSpy('JsonApiFactoryService');
  const params = jasmine.createSpy('JsonApiParametersService');

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      JsonApiService,
      {
        provide: JSON_API_URL,
        useValue: url
      },
      {
        provide: HttpClient,
        useValue: http
      },
      {
        provide: JsonApiFactoryService,
        useValue: factory
      },
      {
        provide: JsonApiParametersService,
        useValue: params
      }
    ]
  }));

  it('should be created', () => {
    const service: JsonApiService = TestBed.get(JsonApiService);
    expect(service).toBeTruthy();
  });

  it('should set static url', () => {
    expect(JsonApiService.url).toEqual(url);
  });

  it('should set static http', () => {
    expect(JsonApiService.http).toEqual(http);
  });

  it('should set static factory', () => {
    expect(JsonApiService.factory).toEqual(factory);
  });

  it('should set static params builder', () => {
    expect(JsonApiService.params).toEqual(params);
  });
});
