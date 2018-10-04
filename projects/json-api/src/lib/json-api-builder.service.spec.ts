import { TestBed } from '@angular/core/testing';

import { JsonApiBuilderService } from './json-api-builder.service';
import { Resource, DocumentIdentifier, DocumentIdentifiers, DocumentResource, DocumentResources } from './classes';
import { fakeDocumentIdentifier } from './mocks/document-identifier';
import { fakeDocumentIdentifiers } from './mocks/document-identifiers';
import { fakeDocumentResource } from './mocks/document-resource';
import { fakeDocumentResources } from './mocks/document-resources';

describe('JsonApiBuilderService', () => {
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

  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JsonApiBuilderService = TestBed.get(JsonApiBuilderService);
    expect(service).toBeTruthy();
  });

  it('should generate a resource', () => {
    const service: JsonApiBuilderService = TestBed.get(JsonApiBuilderService);
    const id = '1';
    const type = 'fake';
    const resource = service.resource(id, type);

    expect(resource).toBeTruthy();
    expect(resource).toEqual(jasmine.any(Resource));
    expect(resource.id).toEqual(id);
    expect(resource.type).toEqual(type);
  });



  it('should generate a document with an identifier', () => {
    const service: JsonApiBuilderService = TestBed.get(JsonApiBuilderService);
    const document = service.documentIdentifier(fakeDocumentIdentifier as any);

    expect(document).toBeTruthy();
    expect(document).toEqual(jasmine.any(DocumentIdentifier));
    expect(document.data.id).toEqual(fakeDocumentIdentifier.data.id);
    expect(document.data.type).toEqual(fakeDocumentIdentifier.data.type);
    expect(document.data.meta).toEqual(fakeDocumentResource.data.meta);
  });

  it('should generate a document with many identifiers', () => {
    const service: JsonApiBuilderService = TestBed.get(JsonApiBuilderService);
    const document = service.documentIdentifiers(fakeDocumentIdentifiers as any);

    expect(document).toBeTruthy();
    expect(document).toEqual(jasmine.any(DocumentIdentifiers));

    document.data.map((identifier, index) => {
      expect(identifier.id).toEqual(fakeDocumentIdentifiers.data[index].id);
      expect(identifier.type).toEqual(fakeDocumentIdentifiers.data[index].type);
      expect(identifier.meta).toEqual(fakeDocumentIdentifiers.data[index].meta);
    });
  });

  it('should generate document with one resource', () => {
    const service: JsonApiBuilderService = TestBed.get(JsonApiBuilderService);
    const document = service.documentResource(fakeDocumentResource as any);

    expect(document).toBeTruthy();
    expect(document).toEqual(jasmine.any(DocumentResource));

    compareResource(document.data, fakeDocumentResource.data);
    document.included.map((resource, index) => compareResource(resource, fakeDocumentResource.included[index]));
  });

  it('should populate document with one resource', () => {
    const service: JsonApiBuilderService = TestBed.get(JsonApiBuilderService);
    const document = service.documentResource(fakeDocumentResource as any);
    const allOriginalResources = fakeDocumentResource.included.concat(fakeDocumentResource.data as any);

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
    const service: JsonApiBuilderService = TestBed.get(JsonApiBuilderService);
    const document = service.documentResources(fakeDocumentResources as any);

    expect(document).toBeTruthy();
    expect(document).toEqual(jasmine.any(DocumentResources));

    document.data.map((resource, index) => compareResource(resource, fakeDocumentResources.data[index]));
    document.included.map((resource, index) => compareResource(resource, fakeDocumentResources.included[index]));
  });

  it('should populate document with many resource', () => {
    const service: JsonApiBuilderService = TestBed.get(JsonApiBuilderService);
    const document = service.documentResources(fakeDocumentResources as any);
    const allOriginalResources = fakeDocumentResources.included.concat(fakeDocumentResources.data as any);

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
