import { TestBed, inject, async } from '@angular/core/testing';

import { JsonApiInterceptorService } from './json-api-interceptor.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { JSON_API_VERSION } from './json-api-version';
import { JSON_API_URL } from './json-api-url';

const url = 'http://fake.api.url';
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
        provide: JSON_API_URL,
        useValue: url
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

  describe('when calling json-api route', () => {
    const route = `${url}/some/route`;

    it('should add Content-Type header', async(inject([
      HttpClient,
      HttpTestingController
    ], (http: HttpClient, backend: HttpTestingController) => {
      http.get(route).subscribe();
      const get = backend.expectOne(route);
      expect(get.request.headers.has('Content-Type'));
      expect(get.request.headers.get('Content-Type')).toBe(contentType);
    })));

    it('should add Accept header', async(inject([
      HttpClient,
      HttpTestingController
    ], (http: HttpClient, backend: HttpTestingController) => {
      http.get(route).subscribe();
      const get = backend.expectOne(route);
      expect(get.request.headers.has('Accept'));
      expect(get.request.headers.get('Accept')).toBe(accept);
    })));
  });

  describe('when calling not-json-api route', () => {
    const route = 'http://www.foo.fr/some/route';

    it('should not add Content-Type header', async(inject([
      HttpClient,
      HttpTestingController
    ], (http: HttpClient, backend: HttpTestingController) => {
      http.get(route).subscribe();
      const get = backend.expectOne(route);
      expect(get.request.headers.has('Content-Type')).toBeFalsy();
    })));

    it('should not add Accept header', async(inject([
      HttpClient,
      HttpTestingController
    ], (http: HttpClient, backend: HttpTestingController) => {
      http.get(route).subscribe();
      const get = backend.expectOne(route);
      expect(get.request.headers.has('Accept')).toBeFalsy();
    })));
  });
});
