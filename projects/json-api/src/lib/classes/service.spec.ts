import { TestBed, inject, async } from '@angular/core/testing';
import { JSON_API_VERSION } from '../json-api-version';
import { JSON_API_URL } from '../json-api-url';
import { Service } from './service';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Resource } from './resource';
import { JsonApiParametersService } from '../json-api-parameters.service';
import { JsonApiRegisterService } from '../json-api-register.service';
import { HttpClient } from '@angular/common/http';
import { JsonApiModule } from '../json-api.module';
import { JsonDocumentResource } from '../interfaces/json-document-resource';
import { JsonDocumentResources } from '../interfaces/json-document-resources';
import { DocumentResource } from './document-resource';
import { DocumentResources } from './document-resources';
import { DocumentErrors } from './document-errors';

const version = 'test.v0';
const url = 'http://fake.api.url';
const type = 'fake';
const fakeDocumentResources: JsonDocumentResources = {
  data: [
    { id: '1', type, attributes: { }, relationships: {
      foo: {
        data: { id: '3', type },
        links: { }
      },
      foos: {
        data: [
          { id: '2', type },
          { id: '3', type }
        ],
        links: { }
      }
    }, meta: { }, links: { } },
    { id: '2', type, attributes: { }, relationships: {
      foo: {
        data: { id: '1', type },
        links: { }
      },
      foos: {
        data: [
          { id: '3', type },
        ],
        links: { }
      }
    }, meta: { }, links: { } }
  ],
  meta: { },
  included: [
    { id: '3', type, attributes: { }, relationships: {
      foo: {
        data: { id: '1', type },
        links: { }
      },
      foos: {
        data: [
          { id: '1', type },
          { id: '2', type }
        ],
        links: { }
      }
    }, meta: { }, links: { } }
  ],
  links: { },
  jsonapi: {
    version,
    meta: { }
  }
};
const fakeDocumentResource: JsonDocumentResource = {
  data: { id: '1', type, attributes: { }, relationships: {
    foo: {
      data: { id: '1', type },
      links: { }
    },
    foos: {
      data: [
        { id: '1', type },
        { id: '2', type },
      ],
      links: { }
    }
  }, meta: { }, links: { } },
  meta: { },
  included: [
    { id: '2', type, attributes: { }, relationships: {
      foo: {
        data: { id: '1', type },
        links: { }
      }
    }, meta: { }, links: { } }
  ],
  links: { },
  jsonapi: {
    version,
    meta: { }
  }
};

describe('Service', () => {
  let httpMock: HttpTestingController;
  let service: Service;

  const parametersService = jasmine.createSpyObj('JsonApiParametersService', [
    'httpParams'
  ]);
  const registerService = jasmine.createSpyObj('JsonApiRegisterService', {
    get: Resource
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: JSON_API_VERSION,
          useValue: version
        },
        {
          provide: JSON_API_URL,
          useValue: url
        },
        {
          provide: JsonApiParametersService,
          useValue: parametersService
        },
        {
          provide: JsonApiRegisterService,
          useValue: registerService
        }
      ]
    });
  });

  beforeEach(() => {
    httpMock = TestBed.get(HttpTestingController);
  });

  beforeEach(() => {
    JsonApiModule.url = url;
    JsonApiModule.http = TestBed.get(HttpClient);
    JsonApiModule.params = TestBed.get(JsonApiParametersService);
    JsonApiModule.register = TestBed.get(JsonApiRegisterService);
  });

  beforeEach(() => {
    service = new Service(type, class Foo extends Resource {});
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create resource', () => {
    const resource = service.create();
    expect(resource).toBeTruthy();
    expect(resource).toEqual(jasmine.any(service.resource));
    expect(resource.id).toBeFalsy();
    expect(resource.type).toEqual(service.type);
  });

  describe('find all', () => {
    let request: TestRequest;

    it('should return a DocumentErrors when failed', (done) => {
      service.all().subscribe(
        () => done.fail('should not succeed'),
        err => {
          expect(err).toEqual(jasmine.any(DocumentErrors));
          done();
        }
      );
      request = httpMock.expectOne(`${url}/${service.type}`);
      expect(request.cancelled).toBeFalsy();
      request.error(new ErrorEvent('Get failed'));
    });

    beforeEach(() => {
      service.all().subscribe(res => expect(res).toEqual(jasmine.any(DocumentResources)));
      request = httpMock.expectOne(`${url}/${service.type}`);
      expect(request.cancelled).toBeFalsy();
      request.flush(fakeDocumentResources);
    });

    it('should send get request', () => {
      expect(request.request.method).toBe('GET');
      expect(request.request.responseType).toEqual('json');
    });

    it('should not send body', () => {
      expect(request.request.body).not.toBeTruthy();
    });

    it('should call httpParams method of parametersService', () => {
      expect(parametersService.httpParams).toHaveBeenCalled();
    });

    it('should call get method of registerService', () => {
      expect(registerService.get).toHaveBeenCalled();
    });
  });

  describe('find one', () => {
    let request: TestRequest;

    it('should return a DocumentErrors when failed', (done) => {
      service.find(fakeDocumentResource.data.id).subscribe(
        () => done.fail('should not succeed'),
        err => {
          expect(err).toEqual(jasmine.any(DocumentErrors));
          done();
        }
      );
      request = httpMock.expectOne(`${url}/${service.type}/${fakeDocumentResource.data.id}`);
      expect(request.cancelled).toBeFalsy();
      request.error(new ErrorEvent('Get failed'));
    });

    beforeEach(() => {
      service.find(fakeDocumentResource.data.id).subscribe(res => expect(res).toEqual(jasmine.any(DocumentResource)));
      request = httpMock.expectOne(`${url}/${service.type}/${fakeDocumentResource.data.id}`);
      expect(request.cancelled).toBeFalsy();
      request.flush(fakeDocumentResource);
    });

    it('should send get request', () => {
      expect(request.request.method).toBe('GET');
      expect(request.request.responseType).toEqual('json');
    });

    it('should not send body', () => {
      expect(request.request.body).not.toBeTruthy();
    });

    it('should call httpParams method of parametersService', () => {
      expect(parametersService.httpParams).toHaveBeenCalled();
    });

    it('should call get method of registerService', () => {
      expect(registerService.get).toHaveBeenCalled();
    });
  });

  afterEach(() => httpMock.verify());
});
