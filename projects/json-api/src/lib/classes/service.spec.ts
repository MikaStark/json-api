import { TestBed, inject, async } from '@angular/core/testing';
import { JSON_API_VERSION } from '../json-api-version';
import { JSON_API_URL } from '../json-api-url';
import { Service } from './service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Resource } from './resource';
import { JsonApiParametersService } from '../json-api-parameters.service';
import { JsonApiRegisterService } from '../json-api-register.service';
import { HttpClient } from '@angular/common/http';
import { JsonApiModule } from '../json-api.module';
import { JsonDocumentResource } from '../interfaces/json-document-resource';
import { JsonDocumentResources } from '../interfaces/json-document-resources';
import { DocumentResource } from './document-resource';
import { DocumentResources } from './document-resources';

const version = 'test.v0';
const url = 'http://fake.api.url';
const type = 'fake';

describe('Service', () => {
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
    const http = TestBed.get(HttpClient);

    JsonApiModule.url = url;
    JsonApiModule.http = http;
    JsonApiModule.params = parametersService;
    JsonApiModule.register = registerService;

    service = new Service();
    service.type = type;
    service.resource = class Foo extends Resource {};
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

  it('should find all resources', async(inject([
    HttpTestingController
  ], (backend: HttpTestingController) => {
    const documentWithmanyResources: JsonDocumentResources = {
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

    service.all({})
      .subscribe(document => {
        expect(parametersService.httpParams).toHaveBeenCalled();
        expect(document).toEqual(jasmine.any(DocumentResources));
      });

    const request = backend.expectOne(`${url}/${type}`);

    expect(request.cancelled).toBeFalsy();
    expect(request.request.method).toBe('GET');
    expect(request.request.body).toBeFalsy();
    expect(request.request.responseType).toEqual('json');

    request.flush(documentWithmanyResources);
  })));

  it('should find one resource', async(inject([
    HttpTestingController
  ], (backend: HttpTestingController) => {
    const documentWithOneResource: JsonDocumentResource = {
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
    service.find(documentWithOneResource.data.id, {})
      .subscribe(document => {
        expect(parametersService.httpParams).toHaveBeenCalled();
        expect(document).toEqual(jasmine.any(DocumentResource));
      });

    const request = backend.expectOne(`${url}/${type}/${documentWithOneResource.data.id}`);

    expect(request.cancelled).toBeFalsy();
    expect(request.request.method).toBe('GET');
    expect(request.request.body).toBeFalsy();
    expect(request.request.responseType).toEqual('json');

    request.flush(documentWithOneResource);
  })));

  afterEach(inject([HttpTestingController], (httpMock: HttpTestingController) => {
    httpMock.verify();
  }));
});
