import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { JSON_API_URL } from './json-api-url';
import { JSON_API_VERSION } from './json-api-version';
import { JsonApiInterceptor } from './json-api.interceptor';

const url = 'http://fake.api.url';
const verison = 'test.v1';
const contentType = 'application/vnd.api+json';
const accept = `application/vnd.${verison}+json`;

describe('JsonApiInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: JsonApiInterceptor,
          multi: true,
        },
        {
          provide: JSON_API_URL,
          useValue: url,
        },
        {
          provide: JSON_API_VERSION,
          useValue: verison,
        },
      ],
    }),
  );

  beforeEach(() => {
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be created', () => {
    const service: JsonApiInterceptor = TestBed.inject(JsonApiInterceptor);
    expect(service).toBeTruthy();
  });

  describe('when calling json-api route', () => {
    const route = `${url}/some/route`;

    it('should add Content-Type header', () => {
      http.get(route).subscribe();
      const get = controller.expectOne(route);
      expect(get.request.headers.has('Content-Type'));
      expect(get.request.headers.get('Content-Type')).toBe(contentType);
    });

    it('should add Accept header', () => {
      http.get(route).subscribe();
      const get = controller.expectOne(route);
      expect(get.request.headers.has('Accept'));
      expect(get.request.headers.get('Accept')).toBe(accept);
    });
  });

  describe('when calling not-json-api route', () => {
    const route = 'http://www.foo.fr/some/route';

    it('should not add Content-Type header', () => {
      http.get(route).subscribe();
      const get = controller.expectOne(route);
      expect(get.request.headers.has('Content-Type')).toBeFalsy();
    });

    it('should not add Accept header', () => {
      http.get(route).subscribe();
      const get = controller.expectOne(route);
      expect(get.request.headers.has('Accept')).toBeFalsy();
    });
  });
});
