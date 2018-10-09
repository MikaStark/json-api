import { Resource } from './resource';
import { TestBed, async, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JSON_API_VERSION, JSON_API_URL, JsonApiModule, DocumentIdentifier } from '../../public_api';
import { JsonApiParametersService } from '../json-api-parameters.service';
import { HttpClient } from '@angular/common/http';
import { DocumentResource } from './document-resource';
import { DocumentResources } from './document-resources';
import { DocumentIdentifiers } from './document-identifiers';
import { JsonDocumentResource, JsonDocumentIdentifier, JsonDocumentIdentifiers, JsonDocumentResources } from '../interfaces';
import { JsonApiFactoryService } from '../json-api-factory.service';
import { JsonApiService } from '../json-api.service';

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
  const factoryService = jasmine.createSpyObj('JsonApiFactoryService', [
    'documentWithManyResources',
    'documentWithOneResource',
    'documentWithManyIdentifiers',
    'documentWithOneIdentifier',
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
          provide: JsonApiModule,
          useValue: builder
        },
        {
          provide: JsonApiFactoryService,
          useValue: factoryService
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

    JsonApiService.url = url;
    JsonApiService.http = http;
    JsonApiService.params = parametersService;
    JsonApiService.factory = factoryService;

    factoryService.documentWithOneResource.calls.reset();
    factoryService.documentWithManyResources.calls.reset();
    factoryService.documentWithOneIdentifier.calls.reset();
    factoryService.documentWithManyIdentifiers.calls.reset();
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

    factoryService.documentWithOneResource.and.callFake(document => new DocumentResource(document.data, document.meta));

    resource.save({})
      .subscribe(document => {
        expect(resource.id).toEqual(documentWithOneResource.data.id);
        expect(resource.attributes).toEqual(documentWithOneResource.data.attributes);
        expect(document.data.deleted).toBeFalsy();
        expect(parametersService.httpParams).toHaveBeenCalled();
        expect(factoryService.documentWithOneResource).toHaveBeenCalled();
        expect(factoryService.documentWithManyResources).not.toHaveBeenCalled();
        expect(factoryService.documentWithOneIdentifier).not.toHaveBeenCalled();
        expect(factoryService.documentWithManyIdentifiers).not.toHaveBeenCalled();
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

    factoryService.documentWithOneResource.and.callFake(document => new DocumentResource(document.data, document.meta));

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
        expect(factoryService.documentWithOneResource).toHaveBeenCalled();
        expect(factoryService.documentWithManyResources).not.toHaveBeenCalled();
        expect(factoryService.documentWithOneIdentifier).not.toHaveBeenCalled();
        expect(factoryService.documentWithManyIdentifiers).not.toHaveBeenCalled();
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
    factoryService.documentWithOneResource.and.callFake(document => new DocumentResource(document.data, document.meta));

    resource.id = id;

    resource.delete()
      .subscribe(() => {
        expect(resource.deleted).toBeTruthy();
        expect(parametersService.httpParams).not.toHaveBeenCalled();
        expect(factoryService.documentWithOneResource).not.toHaveBeenCalled();
        expect(factoryService.documentWithManyResources).not.toHaveBeenCalled();
        expect(factoryService.documentWithOneIdentifier).not.toHaveBeenCalled();
        expect(factoryService.documentWithManyIdentifiers).not.toHaveBeenCalled();
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

    factoryService.documentWithOneIdentifier.and.callFake(document => new DocumentIdentifier(document.data, document.meta));

    resource.id = id;

    resource.getRelationship(relationship)
      .subscribe(document => {
        expect(document).toEqual(jasmine.any(DocumentIdentifier));
        expect(document.data.id).toBe(documentWithIdentifier.data.id);
        expect(document.data.type).toBe(documentWithIdentifier.data.type);
        expect(document.data.meta).toBe(documentWithIdentifier.data.meta);
        expect(document.meta).toBe(documentWithIdentifier.meta);
        expect(parametersService.httpParams).not.toHaveBeenCalled();
        expect(factoryService.documentWithOneResource).not.toHaveBeenCalled();
        expect(factoryService.documentWithManyResources).not.toHaveBeenCalled();
        expect(factoryService.documentWithOneIdentifier).toHaveBeenCalled();
        expect(factoryService.documentWithManyIdentifiers).not.toHaveBeenCalled();
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

    factoryService.documentWithManyIdentifiers.and.callFake(document => new DocumentIdentifiers(document.data, document.meta));

    resource.id = id;

    resource.getRelationships(relationship)
      .subscribe(document => {
        expect(document).toEqual(jasmine.any(DocumentIdentifiers));
        document.data.map((data, index) => {
          expect(data.id).toBe(documentWithIdentifiers.data[index].id);
          expect(data.type).toBe(documentWithIdentifiers.data[index].type);
          expect(data.meta).toBe(documentWithIdentifiers.data[index].meta);
        });
        expect(document.meta).toBe(documentWithIdentifiers.meta);
        expect(parametersService.httpParams).not.toHaveBeenCalled();
        expect(factoryService.documentWithOneResource).not.toHaveBeenCalled();
        expect(factoryService.documentWithManyResources).not.toHaveBeenCalled();
        expect(factoryService.documentWithOneIdentifier).not.toHaveBeenCalled();
        expect(factoryService.documentWithManyIdentifiers).toHaveBeenCalled();
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

    factoryService.documentWithOneResource.and.callFake(document => {
      const documentResource = new DocumentResource(document.data, document.meta);
      documentResource.links = document.links;
      return documentResource;
    });

    resource.id = id;

    resource.updateRelationship(relationship, {id, type, meta: {}})
      .subscribe(() => {
        const newRelationship = resource.relationships[relationship];
        const newRelationshipData = resource.relationships[relationship].data as Resource;
        expect(newRelationship).toBeTruthy();
        expect(newRelationshipData.id).toEqual(documentWithOneResource.data.id);
        expect(newRelationshipData.type).toEqual(documentWithOneResource.data.type);
        expect(newRelationshipData.attributes).toEqual(documentWithOneResource.data.attributes);
        expect(newRelationship.links).toEqual(documentWithOneResource.links);
        expect(resource.deleted).toBeFalsy();
        expect(parametersService.httpParams).not.toHaveBeenCalled();
        expect(factoryService.documentWithOneResource).toHaveBeenCalled();
        expect(factoryService.documentWithManyResources).not.toHaveBeenCalled();
        expect(factoryService.documentWithOneIdentifier).not.toHaveBeenCalled();
        expect(factoryService.documentWithManyIdentifiers).not.toHaveBeenCalled();
      });

    const request = backend.expectOne(`${url}/${type}/${id}/relationships/${relationship}`);

    expect(request.cancelled).toBeFalsy();
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toBeTruthy();
    expect(request.request.responseType).toEqual('json');

    request.flush(documentWithOneResource);
  })));

  it('should update to-many relationships', async(inject([
    HttpTestingController
  ], (backend: HttpTestingController) => {
    const documentWithManyResources: JsonDocumentResources = {
      data: [
        { id: '1', type, attributes: { }, relationships: { }, meta: { }, links: { } },
        { id: '2', type, attributes: { }, relationships: { }, meta: { }, links: { } }
      ],
      meta: { },
      included: [],
      links: { },
      jsonapi: {
        version,
        meta: { }
      }
    };

    factoryService.documentWithManyResources.and.callFake(document => {
      const documentResources = new DocumentResources(document.data, document.meta);
      documentResources.links = document.links;
      return documentResources;
    });

    resource.id = id;

    resource.updateRelationships(relationship, [
      {id: '1', type, meta: {}},
      {id: '2', type, meta: {}}
    ])
      .subscribe(() => {
        const newRelationships = resource.relationships[relationship];
        const newRelationshipsData = resource.relationships[relationship].data as Resource[];
        expect(newRelationships).toBeTruthy();
        newRelationshipsData.map((data, index) => {
          expect(data.id).toEqual(documentWithManyResources.data[index].id);
          expect(data.type).toEqual(documentWithManyResources.data[index].type);
          expect(data.attributes).toEqual(documentWithManyResources.data[index].attributes);
        });
        expect(newRelationships.links).toEqual(documentWithManyResources.links);
        expect(resource.deleted).toBeFalsy();
        expect(parametersService.httpParams).not.toHaveBeenCalled();
        expect(factoryService.documentWithOneResource).not.toHaveBeenCalled();
        expect(factoryService.documentWithManyResources).toHaveBeenCalled();
        expect(factoryService.documentWithOneIdentifier).not.toHaveBeenCalled();
        expect(factoryService.documentWithManyIdentifiers).not.toHaveBeenCalled();
      });

    const request = backend.expectOne(`${url}/${type}/${id}/relationships/${relationship}`);

    expect(request.cancelled).toBeFalsy();
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toBeTruthy();
    expect(request.request.responseType).toEqual('json');

    request.flush(documentWithManyResources);
  })));

  it('should save relationships', async(inject([
    HttpTestingController
  ], (backend: HttpTestingController) => {
    const documentWithManyResources: JsonDocumentResources = {
      data: [
        { id: '1', type, attributes: { }, relationships: { }, meta: { }, links: { } },
        { id: '2', type, attributes: { }, relationships: { }, meta: { }, links: { } }
      ],
      meta: { },
      included: [],
      links: { },
      jsonapi: {
        version,
        meta: { }
      }
    };

    factoryService.documentWithManyResources.and.callFake(document => {
      const documentResources = new DocumentResources(document.data, document.meta);
      documentResources.links = document.links;
      return documentResources;
    });

    resource.id = id;
    resource.relationships[relationship] = {
      data: [
        { id: '3', type, attributes: { } } as any
      ],
      links: { }
    };

    resource.saveRelationships(relationship, [
      {id: '1', type, meta: {}},
      {id: '2', type, meta: {}}
    ])
      .subscribe(() => {
        const newRelationships = resource.relationships[relationship];
        const newRelationshipsData = resource.relationships[relationship].data as Resource[];
        const allRelationships = newRelationshipsData.concat(documentWithManyResources.data as any);
        expect(newRelationships).toBeTruthy();
        newRelationshipsData.map((data, index) => {
          expect(data.id).toEqual(allRelationships[index].id);
          expect(data.type).toEqual(allRelationships[index].type);
          expect(data.attributes).toEqual(allRelationships[index].attributes);
        });
        expect(newRelationships.links).toEqual(documentWithManyResources.links);
        expect(resource.deleted).toBeFalsy();
        expect(parametersService.httpParams).toHaveBeenCalled();
        expect(factoryService.documentWithOneResource).not.toHaveBeenCalled();
        expect(factoryService.documentWithManyResources).toHaveBeenCalled();
        expect(factoryService.documentWithOneIdentifier).not.toHaveBeenCalled();
        expect(factoryService.documentWithManyIdentifiers).not.toHaveBeenCalled();
      });

    const request = backend.expectOne(`${url}/${type}/${id}/relationships/${relationship}`);

    expect(request.cancelled).toBeFalsy();
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeTruthy();
    expect(request.request.responseType).toEqual('json');

    request.flush(documentWithManyResources);
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
        expect(factoryService.documentWithOneResource).not.toHaveBeenCalled();
        expect(factoryService.documentWithManyResources).not.toHaveBeenCalled();
        expect(factoryService.documentWithOneIdentifier).not.toHaveBeenCalled();
        expect(factoryService.documentWithManyIdentifiers).not.toHaveBeenCalled();
      });

    const request = backend.expectOne(`${url}/${type}/${id}/relationships/${relationship}`);

    expect(request.cancelled).toBeFalsy();
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toBeTruthy();
    expect(request.request.responseType).toEqual('json');

    request.flush(null);
  })));
});
