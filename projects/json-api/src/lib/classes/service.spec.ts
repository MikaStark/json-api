import { TestBed, inject, async } from '@angular/core/testing';
import { JsonApiModule } from '../json-api.module';
import { JSON_API_VERSION } from '../json-api-version';
import { JSON_API_URL } from '../json-api-url';
import { Service } from './service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeDocumentResources } from '../mocks/document-resources';
import { fakeDocumentResource } from '../mocks/document-resource';
import { Resource } from './resource';
import { DocumentResource } from './document-resource';
import { DocumentResources } from './document-resources';
import { JsonApiParametersService } from '../json-api-parameters.service';

const version = 'test.v0';
const url = 'http://fake.api.url';
const type = 'fake';

describe('JsonApiQueriesService', () => {
  let service: Service;
  const parametersService = jasmine.createSpyObj('JsonApiParametersService', ['httpParams']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [JsonApiModule, HttpClientTestingModule],
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
        }
      ]
    });
  });

  beforeEach(() => {
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
      .subscribe(document => {
        expect(parametersService.httpParams).toHaveBeenCalled();
        expect(document).toEqual(jasmine.any(DocumentResources));
      });

    const request = backend.expectOne(`${url}/${type}`);

    expect(request.cancelled).toBeFalsy();
    expect(request.request.method).toBe('GET');
    expect(request.request.body).toBeFalsy();
    expect(request.request.responseType).toEqual('json');

    request.flush(fakeDocumentResources);
  })));

  it('should find one resource', async(inject([
    HttpTestingController
  ], (backend: HttpTestingController) => {
    service.find(fakeDocumentResource.data.id, {})
      .subscribe(document => {
        expect(parametersService.httpParams).toHaveBeenCalled();
        expect(document).toEqual(jasmine.any(DocumentResource));
      });

    const request = backend.expectOne(`${url}/${type}/${fakeDocumentResource.data.id}`);

    expect(request.cancelled).toBeFalsy();
    expect(request.request.method).toBe('GET');
    expect(request.request.body).toBeFalsy();
    expect(request.request.responseType).toEqual('json');

    request.flush(fakeDocumentResource);
  })));

  afterEach(inject([HttpTestingController], (httpMock: HttpTestingController) => {
    httpMock.verify();
  }));
});
