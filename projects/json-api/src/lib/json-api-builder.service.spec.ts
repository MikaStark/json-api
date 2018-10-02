import { TestBed } from '@angular/core/testing';

import { JsonApiBuilderService } from './json-api-builder.service';

import { Resource } from './classes/resource';
import { DocumentResource } from './classes/document-resource';
import { DocumentCollection } from './classes/document-collection';

describe('JsonApiBuilderService', () => {
  let service: JsonApiBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(JsonApiBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('resource document', () => {
    let documentResource: DocumentResource;

    beforeAll(() => documentResource = new DocumentResource(
      new Resource('1', 'foo', {
        some: 'data'
      }, {
          foo: new DocumentResource(
            new Resource('2', 'foo')
          ),
          tests: new DocumentCollection([
            new Resource('1', 'tests'),
            new Resource('2', 'tests')
          ])
        }), [
        new Resource('1', 'tests', {
          test: 'data'
        }),
        new Resource('2', 'tests', {
          test: 'more data'
        }, {
            foo: new DocumentResource(
              new Resource('3', 'foo')
            )
          }),
        new Resource('3', 'foo', {
          foo: 'here it comes the data'
        })
      ])
    );

    beforeAll(() => service.resource(documentResource));

    it('should populate data from included', () => {
      const relationships = documentResource.data.relationships;
      const relationship = relationships.tests.data[0];
      const resource = documentResource.included[0];
      expect(relationship.attributes).toBe(resource.attributes);
      expect(relationship.relationships).toBe(resource.relationships);
    });
    it('should populate included from included', () => {
      const relationship = documentResource.included[1].relationships.foo.data as Resource;
      const resource = documentResource.included[2];
      expect(relationship.attributes).toBe(resource.attributes);
      expect(relationship.relationships).toBe(resource.relationships);
    });
  });

  describe('collection document', () => {
    let documentCollection: DocumentCollection;

    beforeAll(() => {
      documentCollection = new DocumentCollection([
        new Resource('1', 'foo', {
          some: 'data'
        }, {
            foo: new DocumentResource(
              new Resource('2', 'foo')
            )
          }),
        new Resource('2', 'foo', {
          some: 'more data'
        }, {
            tests: new DocumentCollection([
              new Resource('1', 'tests'),
              new Resource('2', 'tests')
            ])
          })
      ], [
          new Resource('1', 'tests', {
            test: 'data'
          }),
          new Resource('2', 'tests', {
            test: 'more data'
          }, {
              foo: new DocumentResource(
                new Resource('3', 'foo')
              )
            }),
          new Resource('3', 'foo', {
            foo: 'here it comes the data'
          })
        ]);
    });

    beforeAll(() => service.collection(documentCollection));

    it('should populate data from included', () => {
      const relationships = documentCollection.data[1].relationships;
      const relationship = relationships.tests.data[0];
      const resource = documentCollection.included[0];
      expect(relationship.attributes).toBe(resource.attributes);
      expect(relationship.relationships).toBe(resource.relationships);
    });
    it('should populate included from included', () => {
      const relationship = documentCollection.included[1].relationships.foo.data as Resource;
      const resource = documentCollection.included[2];
      expect(relationship.attributes).toBe(resource.attributes);
      expect(relationship.relationships).toBe(resource.relationships);
    });
    it('should populate data from data', () => {
      const relationship = documentCollection.data[0].relationships.foo.data as Resource;
      const resource = documentCollection.data[1];
      expect(relationship.attributes).toBe(resource.attributes);
      expect(relationship.relationships).toBe(resource.relationships);
    });
  });
});
