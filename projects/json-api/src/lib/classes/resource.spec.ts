import { Resource } from './resource';
import { TestBed, async, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JsonApiParametersService } from '../json-api-parameters.service';
import { HttpClient } from '@angular/common/http';
import { DocumentIdentifiers } from './document-identifiers';
import { JsonApiModule } from '../json-api.module';
import { JSON_API_VERSION } from '../json-api-version';
import { JSON_API_URL } from '../json-api-url';
import { JsonDocumentResource } from '../interfaces/json-document-resource';
import { JsonDocumentIdentifier } from '../interfaces/json-document-identifier';
import { DocumentIdentifier } from './document-identifier';
import { JsonDocumentIdentifiers } from '../interfaces/json-document-identifiers';
import { JsonApiRegisterService } from '../json-api-register.service';
import { DocumentResource } from './document-resource';

const version = 'test.v0';
const url = 'http://fake.api.url';
const id = '1';
const type = 'fake';
const relationship = 'fake';

describe('Resource', () => {
  let resource: Resource;
  let httpMock: HttpTestingController;
  const builder = jasmine.createSpyObj('JsonApiModule', {
    builder: {
      get: jasmine.createSpy('get'),
      set: jasmine.createSpy('set')
    }
  });
  const parametersService = jasmine.createSpyObj('JsonApiParametersService', [
    'httpParams'
  ]);
  const registersService = jasmine.createSpyObj('JsonApiRegisterService', {
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
          provide: JsonApiModule,
          useValue: builder
        },
        {
          provide: JsonApiRegisterService,
          useValue: registersService
        },
        {
          provide: JsonApiParametersService,
          useValue: parametersService
        }
      ]
    });
  });

  beforeEach(() => {
    const http = TestBed.get(HttpClient);
    httpMock = TestBed.get(HttpTestingController);
    resource = new Resource(null, type);

    JsonApiModule.url = url;
    JsonApiModule.http = http;
    JsonApiModule.params = parametersService;
    JsonApiModule.register = registersService;

    registersService.get.calls.reset();
    parametersService.httpParams.calls.reset();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should save', async(inject([
    HttpTestingController
  ], (backend: HttpTestingController) => {
    const documentWithOneResource: JsonDocumentResource = {
      data: { id: '1', type, attributes: { }, relationships: { }, meta: { }, links: { } },
      meta: { },
      included: [],
      links: { },
      jsonapi: {
        version,
        meta: { }
      }
    };
    resource.attributes = {
      foo: true
    };
    resource.relationships.foo = {
      data: new Resource('2', 'foo'),
      links: {}
    };
    resource.relationships.foos = {
      data: [
        new Resource('3', 'foo'),
        new Resource('4', 'foo')
      ],
      links: {}
    };

    resource.save({})
      .subscribe(document => {
        expect(resource.id).toEqual(documentWithOneResource.data.id);
        expect(resource.attributes).toEqual(documentWithOneResource.data.attributes);
        expect(document.data.deleted).toBeFalsy();
        expect(parametersService.httpParams).toHaveBeenCalled();
        expect(registersService.get).toHaveBeenCalled();
      });

    const request = backend.expectOne(`${url}/${type}`);

    expect(request.cancelled).toBeFalsy();
    expect(request.request.method).toBe('POST');
    expect(request.request.responseType).toEqual('json');

    expect(request.request.body).toBeTruthy();
    expect(request.request.body.data).toBeTruthy();
    expect(request.request.body.data.attributes).toEqual(resource.attributes);
    expect(request.request.body.data.relationships).toEqual(resource.relationshipsIdentifiers);

    request.flush(documentWithOneResource);
  })));

  it('should update', async(inject([
    HttpTestingController
  ], (backend: HttpTestingController) => {
    const documentWithOneResource: JsonDocumentResource = {
      data: { id: '1', type, attributes: { }, relationships: { }, meta: { }, links: { } },
      meta: { },
      included: [],
      links: { },
      jsonapi: {
        version,
        meta: { }
      }
    };

    resource.id = id;
    resource.attributes = {
      foo: true
    };
    resource.relationships.foo = {
      data: new Resource('2', 'foo'),
      links: {}
    };
    resource.relationships.foos = {
      data: [
        new Resource('3', 'foo'),
        new Resource('4', 'foo')
      ],
      links: {}
    };

    resource.update({})
      .subscribe(document => {
        expect(resource.id).toEqual(documentWithOneResource.data.id);
        expect(resource.attributes).toEqual(documentWithOneResource.data.attributes);
        expect(document.data.deleted).toBeFalsy();
        expect(parametersService.httpParams).toHaveBeenCalled();
        expect(registersService.get).toHaveBeenCalled();
      });

    const request = backend.expectOne(`${url}/${type}/${id}`);

    expect(request.cancelled).toBeFalsy();
    expect(request.request.method).toBe('PATCH');
    expect(request.request.responseType).toEqual('json');
    expect(request.request.body).toBeTruthy();

    expect(request.request.body.data).toBeTruthy();
    expect(request.request.body.data.attributes).toEqual(resource.attributes);
    expect(request.request.body.data.relationships).toEqual(resource.relationshipsIdentifiers);

    request.flush(documentWithOneResource);
  })));

  it('should delete', async(inject([
    HttpTestingController
  ], (backend: HttpTestingController) => {
    resource.id = id;

    resource.delete()
      .subscribe(() => {
        expect(resource.deleted).toBeTruthy();
        expect(parametersService.httpParams).not.toHaveBeenCalled();
        expect(registersService.get).not.toHaveBeenCalled();
      });

    const request = backend.expectOne(`${url}/${type}/${id}`);

    expect(resource.deleted).toBeFalsy();
    expect(request.cancelled).toBeFalsy();
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toBeFalsy();
    expect(request.request.responseType).toEqual('json');

    request.flush(null);
  })));

  it('should get to-one relationship', async(inject([
    HttpTestingController
  ], (backend: HttpTestingController) => {
    const documentWithIdentifier: JsonDocumentIdentifier = {
      data: { id: '1', type, meta: { } },
      meta: { },
      links: { },
      jsonapi: {
        version,
        meta: { }
      }
    };

    resource.id = id;

    resource.getRelationship(relationship)
      .subscribe(document => {
        expect(document).toEqual(jasmine.any(DocumentIdentifier));
        expect(document.data.id).toBe(documentWithIdentifier.data.id);
        expect(document.data.type).toBe(documentWithIdentifier.data.type);
        expect(document.meta).toBe(documentWithIdentifier.meta);
        expect(parametersService.httpParams).not.toHaveBeenCalled();
        expect(registersService.get).not.toHaveBeenCalled();
      });

    const request = backend.expectOne(`${url}/${type}/${id}/relationships/${relationship}`);

    expect(request.cancelled).toBeFalsy();
    expect(request.request.method).toBe('GET');
    expect(request.request.body).toBeFalsy();
    expect(request.request.responseType).toEqual('json');

    request.flush(documentWithIdentifier);
  })));

  it('should get to-many relationships', async(inject([
    HttpTestingController
  ], (backend: HttpTestingController) => {
    const documentWithIdentifiers: JsonDocumentIdentifiers = {
      data: [
        { id: '1', type, meta: { } },
        { id: '2', type, meta: { } }
      ],
      meta: { },
      links: { },
      jsonapi: {
        version,
        meta: { }
      }
    };

    resource.id = id;

    resource.getRelationships(relationship)
      .subscribe(document => {
        expect(document).toEqual(jasmine.any(DocumentIdentifiers));
        document.data.map((data, index) => {
          expect(data.id).toBe(documentWithIdentifiers.data[index].id);
          expect(data.type).toBe(documentWithIdentifiers.data[index].type);
        });
        expect(document.meta).toBe(documentWithIdentifiers.meta);
        expect(parametersService.httpParams).not.toHaveBeenCalled();
        expect(registersService.get).not.toHaveBeenCalled();
      });

    const request = backend.expectOne(`${url}/${type}/${id}/relationships/${relationship}`);

    expect(request.cancelled).toBeFalsy();
    expect(request.request.method).toBe('GET');
    expect(request.request.body).toBeFalsy();
    expect(request.request.responseType).toEqual('json');

    request.flush(documentWithIdentifiers);
  })));

  it('should update to-one relationship', async(inject([
    HttpTestingController
  ], (backend: HttpTestingController) => {
    const newRelationshipId = '2';
    const documentWithOneIdentifier: JsonDocumentIdentifier = {
      data: { id: newRelationshipId, type },
      meta: { },
      links: { },
      jsonapi: {
        version,
        meta: { }
      }
    };

    resource.id = id;
    resource.relationships[relationship] = {
      data: new Resource(newRelationshipId, type),
      links: {}
    };

    resource.updateRelationship(relationship)
      .subscribe(() => {
        expect(resource.deleted).toBeFalsy();
        expect(parametersService.httpParams).not.toHaveBeenCalled();
        expect(registersService.get).not.toHaveBeenCalled();
      });

    const request = backend.expectOne(`${url}/${type}/${id}/relationships/${relationship}`);

    expect(request.cancelled).toBeFalsy();
    expect(request.request.method).toBe('PATCH');
    expect(request.request.responseType).toEqual('json');
    expect(request.request.body).toBeTruthy();

    expect(request.request.body.data).toBeTruthy();
    expect(request.request.body.data.id).toEqual(newRelationshipId);
    expect(request.request.body.data.type).toEqual(type);

    request.flush(documentWithOneIdentifier);
  })));

  it('should update to-many relationships', async(inject([
    HttpTestingController
  ], (backend: HttpTestingController) => {
    const newRelationshipId = '2';
    const documentWithManyIdentifiers: JsonDocumentIdentifiers = {
      data: [
        { id: newRelationshipId, type, meta: { } }
      ],
      meta: { },
      links: { },
      jsonapi: {
        version,
        meta: { }
      }
    };

    resource.id = id;
    resource.relationships[relationship] = {
      data: [
        new Resource(newRelationshipId, type)
      ],
      links: {}
    };

    resource.updateRelationships(relationship)
      .subscribe(() => {
        expect(resource.deleted).toBeFalsy();
        expect(parametersService.httpParams).not.toHaveBeenCalled();
        expect(registersService.get).not.toHaveBeenCalled();
      });

    const request = backend.expectOne(`${url}/${type}/${id}/relationships/${relationship}`);

    expect(request.cancelled).toBeFalsy();
    expect(request.request.method).toBe('PATCH');
    expect(request.request.responseType).toEqual('json');
    expect(request.request.body).toBeTruthy();

    expect(request.request.body.data).toBeTruthy();
    expect(request.request.body.data[0].id).toEqual(newRelationshipId);
    expect(request.request.body.data[0].type).toEqual(type);

    request.flush(documentWithManyIdentifiers);
  })));

  it('should save relationships', async(inject([
    HttpTestingController
  ], (backend: HttpTestingController) => {
    const newRelationshipId = '2';
    const documentWithManyIdentifiers: JsonDocumentIdentifiers = {
      data: [
        { id: newRelationshipId, type, meta: { } }
      ],
      meta: { },
      links: { },
      jsonapi: {
        version,
        meta: { }
      }
    };

    resource.id = id;
    resource.relationships[relationship] = {
      data: [
        new Resource(newRelationshipId, type)
      ],
      links: {}
    };

    resource.saveRelationships(relationship)
      .subscribe(() => {
        expect(resource.deleted).toBeFalsy();
        expect(parametersService.httpParams).not.toHaveBeenCalled();
        expect(registersService.get).not.toHaveBeenCalled();
      });

    const request = backend.expectOne(`${url}/${type}/${id}/relationships/${relationship}`);

    expect(request.cancelled).toBeFalsy();
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeTruthy();
    expect(request.request.responseType).toEqual('json');

    expect(request.request.body.data).toBeTruthy();
    expect(request.request.body.data[0].id).toEqual(newRelationshipId);
    expect(request.request.body.data[0].type).toEqual(type);

    request.flush(documentWithManyIdentifiers);
  })));

  it('should delete relationships', async(inject([
    HttpTestingController
  ], (backend: HttpTestingController) => {
    const originalRelationships: any[] = [
      { id: '1', type, attributes: { } },
      { id: '2', type, attributes: { } },
      { id: '3', type, attributes: { } }
    ];

    const relationshipToRemove = [
      {id: '1', type, meta: {}},
      {id: '2', type, meta: {}}
    ];

    const commonRelationships = originalRelationships
      .filter(data => relationshipToRemove.map(toRemove => toRemove.id).includes(data.id));

    const differentsRelationships = originalRelationships
      .filter(data => !relationshipToRemove.map(toRemove => toRemove.id).includes(data.id));

    resource.id = id;
    resource.relationships[relationship] = {
      data: originalRelationships,
      links: { }
    };

    resource.deleteRelationships(relationship, relationshipToRemove)
      .subscribe(() => {
        const relationshipData = resource.relationships[relationship].data as Resource[];
        expect(relationshipData.length).toEqual(originalRelationships.length - commonRelationships.length);
        relationshipData.map((data, index) => {
          expect(data.id).toEqual(differentsRelationships[index].id);
        });
        expect(resource.deleted).toBeFalsy();
        expect(parametersService.httpParams).not.toHaveBeenCalled();
        expect(registersService.get).not.toHaveBeenCalled();
      });

    const request = backend.expectOne(`${url}/${type}/${id}/relationships/${relationship}`);

    expect(request.cancelled).toBeFalsy();
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toBeTruthy();
    expect(request.request.responseType).toEqual('json');

    request.flush(null);
  })));
});
