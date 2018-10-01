import { TestBed, inject, async } from '@angular/core/testing';

import { JsonApiInterceptorService } from './json-api-interceptor.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { JSON_API_VERSION } from './json-api-version';

const verison = 'test.v1';
const contentType = 'application/vnd.api+json';
const accept = `application/vnd.${verison}+json`;

describe('JsonApiInterceptorService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: JsonApiInterceptorService,
          multi: true
        },
        {
          provide: JSON_API_VERSION,
          useValue: verison
        }
      ]
  }));

  afterEach(inject([HttpTestingController], (httpMock: HttpTestingController) => {
    httpMock.verify();
  }));

  it('should be created', () => {
    const service: JsonApiInterceptorService = TestBed.get(JsonApiInterceptorService);
    expect(service).toBeTruthy();
  });

  it(`should add Content-Type header with "${contentType}"`, async(inject([
    HttpClient,
    HttpTestingController
  ], (http: HttpClient, backend: HttpTestingController) => {
    http.get('/api').subscribe();
    const get = backend.expectOne('/api');
    expect(get.request.headers.has('Content-Type'));
    expect(get.request.headers.get('Content-Type')).toBe(contentType);
  })));

  it(`should add Accept header with "${accept}" only if body present`, async(inject([
    HttpClient,
    HttpTestingController
  ], (http: HttpClient, backend: HttpTestingController) => {
    http.get('/api').subscribe();
    const get = backend.expectOne('/api');
    expect(get.request.headers.has('Accept'));
    expect(get.request.headers.get('Accept')).toBe(accept);
  })));
});
