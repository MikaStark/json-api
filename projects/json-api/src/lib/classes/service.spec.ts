import { TestBed, inject, async } from '@angular/core/testing';
import { JSON_API_VERSION } from '../json-api-version';
import { JSON_API_URL } from '../json-api-url';
import { Service } from './service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Resource } from './resource';
import { JsonApiParametersService } from '../json-api-parameters.service';
import { JsonApiRegisterService } from '../json-api-register.service';
import { HttpClient } from '@angular/common/http';
import { JsonApiFactoryService } from '../json-api-factory.service';
import { JsonApiModule } from '../json-api.module';

const version = 'test.v0';
const url = 'http://fake.api.url';
const type = 'fake';

describe('Service', () => {
  let service: Service;
  const parametersService = jasmine.createSpyObj('JsonApiParametersService', [
    'httpParams'
  ]);
  const registerService = jasmine.createSpyObj('JsonApiRegisterService', [
    'get',
    'set'
  ]);
  const factoryService = jasmine.createSpyObj('JsonApiFactoryService', [
    'documentWithManyResources',
    'documentWithOneResource',
  ]);

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
        },
        {
          provide: JsonApiFactoryService,
          useValue: factoryService
        }
      ]
    });
  });

  beforeEach(() => {
    const http = TestBed.get(HttpClient);

    JsonApiModule.url = url;
    JsonApiModule.http = http;
    JsonApiModule.params = parametersService;
    JsonApiModule.factory = factoryService;

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
    service.all({})
      .subscribe(() => {
        expect(parametersService.httpParams).toHaveBeenCalled();
        expect(factoryService.documentWithManyResources).toHaveBeenCalled();
      });

    const request = backend.expectOne(`${url}/${type}`);

    expect(request.cancelled).toBeFalsy();
    expect(request.request.method).toBe('GET');
    expect(request.request.body).toBeFalsy();
    expect(request.request.responseType).toEqual('json');

    request.flush({});
  })));

  it('should find one resource', async(inject([
    HttpTestingController
  ], (backend: HttpTestingController) => {
    const id = '1';
    service.find(id, {})
      .subscribe(() => {
        expect(parametersService.httpParams).toHaveBeenCalled();
        expect(factoryService.documentWithOneResource).toHaveBeenCalled();
      });

    const request = backend.expectOne(`${url}/${type}/${id}`);

    expect(request.cancelled).toBeFalsy();
    expect(request.request.method).toBe('GET');
    expect(request.request.body).toBeFalsy();
    expect(request.request.responseType).toEqual('json');

    request.flush({});
  })));

  afterEach(inject([HttpTestingController], (httpMock: HttpTestingController) => {
    httpMock.verify();
  }));
});
