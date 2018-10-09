import { TestBed } from '@angular/core/testing';

import { JsonApiFactoryService } from './json-api-factory.service';
import { Resource, DocumentIdentifier, DocumentIdentifiers, DocumentResource, DocumentResources } from './classes';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { JSON_API_VERSION, JSON_API_URL, JsonApiRegisterService } from '../public_api';
import { JsonApiParametersService } from './json-api-parameters.service';
import { JsonDocumentIdentifier } from './interfaces/json-document-identifier';
import { JsonDocumentIdentifiers } from './interfaces/json-document-identifiers';
import { JsonDocumentResource } from './interfaces/json-document-resource';
import { JsonDocumentResources } from './interfaces/json-document-resources';
import { Identifier } from './classes/identifier';

const version = 'test.v0';
const url = 'http://fake.api.url';
const type = 'fake';

const jsonDocumentWithIdentifier: JsonDocumentIdentifier = {
  data: { id: '1', type, meta: { } },
  meta: { },
  links: { },
  jsonapi: {
    version,
    meta: { }
  }
};

const jsonDocumentWithIdentifiers: JsonDocumentIdentifiers = {
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

const jsonDocumentWithResource: JsonDocumentResource = {
  data: { id: '1', type, attributes: { }, relationships: {
    fake: {
      data: { id: '2', type, meta: { } },
      links: { }
    },
    fakes: {
      data: [
        { id: '3', type, meta: { } },
        { id: '4', type, meta: { } }
      ],
      links: { }
    }
  }, meta: { }, links: { } },
  meta: { },
  included: [
    { id: '2', type, attributes: { }, relationships: { }, meta: { }, links: { } },
    { id: '3', type, attributes: { }, relationships: {
      fake: {
        data: { id: '1', type, meta: { } },
        links: { }
      },
      fakes: {
        data: [
          { id: '2', type, meta: { } },
          { id: '4', type, meta: { } }
        ],
        links: { }
      },
    }, meta: { }, links: { } },
    { id: '4', type, attributes: { }, relationships: { }, meta: { }, links: { } }
  ],
  links: { },
  jsonapi: {
    version,
    meta: { }
  }
};

const jsonDocumentWithResources: JsonDocumentResources = {
  data: [
    { id: '1', type, attributes: { }, relationships: {
      fake: {
        data: { id: '2', type, meta: { } },
        links: { }
      },
      fakes: {
        data: [
          { id: '3', type, meta: { } },
          { id: '4', type, meta: { } }
        ],
        links: { }
      },
    }, meta: { }, links: { } },
    { id: '2', type, attributes: { }, relationships: { }, meta: { }, links: { } }
  ],
  meta: { },
  included: [
    { id: '3', type, attributes: { }, relationships: {
      fake: {
        data: { id: '1', type, meta: { } },
        links: { }
      },
      fakes: {
        data: [
          { id: '2', type, meta: { } },
          { id: '4', type, meta: { } }
        ],
        links: { }
      },
    }, meta: { }, links: { } },
    { id: '4', type, attributes: { }, relationships: { }, meta: { }, links: { } }
  ],
  links: { },
  jsonapi: {
    version,
    meta: { }
  }
};

describe('JsonApiFactoryService', () => {
  const parametersService = jasmine.createSpyObj('JsonApiParametersService', [
    'httpParams'
  ]);
  const registerService = jasmine.createSpyObj('JsonApiRegisterService', [
    'get',
    'set'
  ]);

  const compareResource = (resource, original) => {
    expect(resource).toEqual(jasmine.any(Resource));
    expect(resource.id).toEqual(original.id);
    expect(resource.type).toEqual(original.type);
    expect(resource.attributes).toEqual(original.attributes);
    expect(resource.meta).toEqual(original.meta);
  };

  const findResource = (resource, originals) => {
    expect(resource).toEqual(jasmine.any(Resource));
    const originalResource = originals
      .find(data => data.id === resource.id && data.type === resource.type);
    expect(originalResource).toBeTruthy();
  };

  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [
      JsonApiFactoryService,
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
  }));

  beforeEach(() => {
    registerService.get.calls.reset();
    registerService.set.calls.reset();

    parametersService.httpParams.calls.reset();
  });

  it('should be created', () => {
    const service: JsonApiFactoryService = TestBed.get(JsonApiFactoryService);
    expect(service).toBeTruthy();
  });

  it('should generate a resource', () => {
    const service: JsonApiFactoryService = TestBed.get(JsonApiFactoryService);
    const id = '1';

    registerService.get.and.callFake(() => Resource);

    const resource = service.resource(id, type);

    expect(registerService.get).toHaveBeenCalled();
    expect(registerService.set).not.toHaveBeenCalled();

    expect(resource).toBeTruthy();
    expect(resource).toEqual(jasmine.any(Resource));
    expect(resource.id).toEqual(id);
    expect(resource.type).toEqual(type);
  });

  it('should generate a identifier', () => {
    const service: JsonApiFactoryService = TestBed.get(JsonApiFactoryService);
    const id = '1';

    registerService.get.and.callFake(() => Resource);

    const identifier = new Identifier(id, type);

    expect(registerService.get).not.toHaveBeenCalled();
    expect(registerService.set).not.toHaveBeenCalled();

    expect(identifier).toBeTruthy();
    expect(identifier).toEqual(jasmine.any(Identifier));
    expect(identifier.id).toEqual(id);
    expect(identifier.type).toEqual(type);
  });

  it('should generate a document with an identifier', () => {
    const service: JsonApiFactoryService = TestBed.get(JsonApiFactoryService);

    const document = service.documentWithOneIdentifier(jsonDocumentWithIdentifier);

    expect(registerService.get).not.toHaveBeenCalled();
    expect(registerService.set).not.toHaveBeenCalled();

    expect(document).toBeTruthy();
    expect(document).toEqual(jasmine.any(DocumentIdentifier));
    expect(document.data.id).toEqual(jsonDocumentWithIdentifier.data.id);
    expect(document.data.type).toEqual(jsonDocumentWithIdentifier.data.type);
    expect(document.data.meta).toEqual(jsonDocumentWithIdentifier.data.meta);
  });

  it('should generate a document with many identifiers', () => {
    const service: JsonApiFactoryService = TestBed.get(JsonApiFactoryService);

    const document = service.documentWithManyIdentifiers(jsonDocumentWithIdentifiers);

    expect(registerService.get).not.toHaveBeenCalled();
    expect(registerService.set).not.toHaveBeenCalled();

    expect(document).toBeTruthy();
    expect(document).toEqual(jasmine.any(DocumentIdentifiers));

    document.data.map((identifier, index) => {
      expect(identifier.id).toEqual(jsonDocumentWithIdentifiers.data[index].id);
      expect(identifier.type).toEqual(jsonDocumentWithIdentifiers.data[index].type);
      expect(identifier.meta).toEqual(jsonDocumentWithIdentifiers.data[index].meta);
    });
  });

  it('should generate document with one resource', () => {
    const service: JsonApiFactoryService = TestBed.get(JsonApiFactoryService);

    registerService.get.and.callFake(() => Resource);

    const document = service.documentWithOneResource(jsonDocumentWithResource);
    const allOriginalResources = jsonDocumentWithResource.included.concat(jsonDocumentWithResource.data);

    expect(registerService.get).toHaveBeenCalled();
    expect(registerService.set).not.toHaveBeenCalled();

    expect(document).toBeTruthy();
    expect(document).toEqual(jasmine.any(DocumentResource));

    expect(registerService.get).toHaveBeenCalledTimes(allOriginalResources.length);

    compareResource(document.data, jsonDocumentWithResource.data);
    document.included.map((resource, index) => compareResource(resource, jsonDocumentWithResource.included[index]));
  });

  it('should populate document with one resource', () => {
    const service: JsonApiFactoryService = TestBed.get(JsonApiFactoryService);
    const document = service.documentWithOneResource(jsonDocumentWithResource);
    const allOriginalResources = jsonDocumentWithResource.included.concat(jsonDocumentWithResource.data);

    for (const name in document.data.relationships) {
      if (Array.isArray(document.data.relationships[name].data)) {
        const relationships = document.data.relationships[name].data as Resource[];
        relationships.map(relationship => findResource(relationship, allOriginalResources));
      } else {
        const relationship = document.data.relationships[name].data as Resource;
        findResource(relationship, allOriginalResources);
      }
    }
  });

  it('should generate document with many resource', () => {
    const service: JsonApiFactoryService = TestBed.get(JsonApiFactoryService);

    registerService.get.and.callFake(() => Resource);

    const document = service.documentWithManyResources(jsonDocumentWithResources);
    const allOriginalResources = jsonDocumentWithResources.included.concat(jsonDocumentWithResources.data);

    expect(registerService.get).toHaveBeenCalled();
    expect(registerService.set).not.toHaveBeenCalled();

    expect(document).toBeTruthy();
    expect(document).toEqual(jasmine.any(DocumentResources));

    expect(registerService.get).toHaveBeenCalledTimes(allOriginalResources.length);

    document.data.map((resource, index) => compareResource(resource, jsonDocumentWithResources.data[index]));
    document.included.map((resource, index) => compareResource(resource, jsonDocumentWithResources.included[index]));
  });

  it('should populate document with many resource', () => {
    const service: JsonApiFactoryService = TestBed.get(JsonApiFactoryService);

    const document = service.documentWithManyResources(jsonDocumentWithResources);
    const allOriginalResources = jsonDocumentWithResources.included.concat(jsonDocumentWithResources.data);

    document.data.map(resource => {
      for (const name in resource.relationships) {
        if (Array.isArray(resource.relationships[name].data)) {
          const relationships = resource.relationships[name].data as Resource[];
          relationships.map(relationship => findResource(relationship, allOriginalResources));
        } else {
          const relationship = resource.relationships[name].data as Resource;
          findResource(relationship, allOriginalResources);
        }
      }
    });
  });
});
