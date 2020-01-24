import { TestBed } from '@angular/core/testing';

import { JsonApiService } from './json-api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JSON_API_URL } from './json-api-url';
import { JsonApiParametersService } from './json-api-parameters.service';
import { JsonApiResource } from './classes';
import { Attribute, Relationship, Resource } from './decorators';
import { Type } from '@angular/core';
import { JsonApiDocument, JsonApiResourceInterface } from './interfaces';

@Resource({ type: 'foos' })
class Foo extends JsonApiResource {
  @Attribute() attr: string;
  @Attribute() attr2: string;
  @Relationship() rel: Foo;
  @Relationship() rels: Foo[];
}

describe('JsonApiService', () => {
  let service: JsonApiService;
  let httpMock: HttpTestingController;

  const parametersService = jasmine.createSpyObj('JsonApiParametersService', ['create']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: JSON_API_URL, useValue: 'http://www.fake.com' },
        { provide: JsonApiParametersService, useValue: parametersService }
      ]
    });
    service = TestBed.get(JsonApiService);
    httpMock = TestBed.get(HttpTestingController as Type<HttpTestingController>);
  });

  beforeEach(() => {
    parametersService.create.calls.reset();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all resources through a GET request that return a many-resources document', () => {
    const document = {
      data: [
        {
          id: '1',
          type: 'foos',
          attributes: {
            attr: 'one',
            attr2: 'two'
          },
          relationships: {
            rel: {
              data: { type: 'foos', id: '2' }
            },
            rels: {
              data: [{ type: 'foos', id: '2' }]
            }
          },
          meta: {
            some: 'data'
          },
          links: {
            self: 'self',
            related: 'related'
          }
        }
      ],
      links: {
        self: 'self',
        related: 'related'
      },
      meta: {
        some: 'meta'
      },
      jsonapi: {
        version: '0'
      },
      included: [
        {
          id: '2',
          type: 'foos',
          attributes: {
            attr: 'one',
            attr2: 'two'
          },
          relationships: {
            rel: {
              data: { type: 'foos', id: '1' }
            },
            rels: {
              data: [{ type: 'foos', id: '1' }]
            }
          },
          meta: {},
          links: {}
        }
      ]
    };

    service.all(Foo).subscribe(({ data, errors, included, jsonapi, links, meta }) => {
      expect(data.length).toEqual(1);
      expect(included.length).toEqual(1);
      expect(errors).toBeUndefined();
      expect(jsonapi).toEqual({
        version: '0'
      });
      expect(links).toEqual({
        self: 'self',
        related: 'related'
      });
      expect(meta).toEqual({
        some: 'meta'
      });
      const [resource] = data;
      expect(resource).toEqual(jasmine.any(JsonApiResource));
      const [relation] = included;
      expect(relation).toEqual(jasmine.any(JsonApiResource));
    });
    const http = httpMock.expectOne('http://www.fake.com/foos');
    expect(http.cancelled).toBeFalsy();
    expect(http.request.method).toBe('GET');
    http.flush(document);
  });

  it('should find a single resource through a GET request that return a single-resource document', () => {
    const document = {
      data: {
        id: '1',
        type: 'foos',
        attributes: {
          attr: 'one',
          attr2: 'two'
        },
        relationships: {
          rel: {
            data: { type: 'foos', id: '2' }
          },
          rels: {
            data: [{ type: 'foos', id: '2' }]
          }
        },
        meta: {
          some: 'data'
        },
        links: {
          self: 'self',
          related: 'related'
        }
      },
      links: {
        self: 'self',
        related: 'related'
      },
      meta: {
        some: 'meta'
      },
      jsonapi: {
        version: '0'
      },
      included: [
        {
          id: '2',
          type: 'foos',
          attributes: {
            attr: 'one',
            attr2: 'two'
          },
          relationships: {
            rel: {
              data: { type: 'foos', id: '1' }
            },
            rels: {
              data: [{ type: 'foos', id: '1' }]
            }
          },
          meta: {},
          links: {}
        }
      ]
    };

    service.find(Foo, '1').subscribe(({ data, meta, links, jsonapi }) => {
      expect(data).toEqual(jasmine.any(JsonApiResource));
      expect(meta).toEqual(document.meta);
      expect(links).toEqual(document.links);
      expect(jsonapi).toEqual(document.jsonapi);
    });
    const mock = httpMock.expectOne('http://www.fake.com/foos/1');
    expect(mock.cancelled).toBeFalsy();
    expect(mock.request.method).toBe('GET');
    mock.flush(document);
  });

  describe('saving a resource', () => {
    it('should fail without type', () => {
      const resource = new JsonApiResource();

      service
        .save(resource)
        .subscribe(fail, error =>
          expect(error.message).toEqual('You can not save a resource without type')
        );

      httpMock.expectNone(`http://www.fake.com/${resource.type}`);
    });

    it('should send a POST request with a body containing resource data', () => {
      const resource = new Foo({
        id: '1',
        attributes: { attr: 'one' },
        relationships: {
          rel: {
            data: new Foo({ id: '2' })
          }
        }
      });

      service.save(resource).subscribe();
      const { cancelled, request } = httpMock.expectOne('http://www.fake.com/foos');
      expect(cancelled).toBeFalsy();
      expect(request.method).toBe('POST');
      expect(request.body).toEqual({
        data: {
          type: 'foos',
          id: '1',
          attributes: {
            attr: 'one'
          },
          relationships: {
            rel: {
              data: { type: 'foos', id: '2' }
            }
          }
        }
      });
    });
  });

  describe('updating a resource', () => {
    it('should fail without id', () => {
      const resource = new Foo();

      service
        .update(resource)
        .subscribe(fail, error =>
          expect(error.message).toEqual('You can not update a resource without id')
        );

      httpMock.expectNone(`http://www.fake.com/${resource.type}/${resource.id}`);
    });

    it('should fail without type', () => {
      const resource = new JsonApiResource();

      service
        .update(resource)
        .subscribe(fail, error =>
          expect(error.message).toEqual('You can not update a resource without type')
        );

      httpMock.expectNone(`http://www.fake.com/${resource.type}/${resource.id}`);
    });

    it('should send a PATCH request with a body with type, id, attributes, relationships, meta and links', () => {
      const resource = new Foo({
        id: '1',
        attributes: { attr: 'one' },
        relationships: {
          rel: {
            data: new Foo({ id: '2' })
          }
        }
      });

      service.update(resource).subscribe();
      const { request } = httpMock.expectOne(`http://www.fake.com/${resource.type}/${resource.id}`);
      expect(request.body).toEqual({
        data: {
          type: 'foos',
          id: '1',
          attributes: {
            attr: 'one'
          },
          relationships: {
            rel: {
              data: { type: 'foos', id: '2' }
            }
          }
        }
      });
    });
  });

  describe('deleting a resource', () => {
    it('should fail with a resource without type', () => {
      const resource = new JsonApiResource();

      service
        .delete(resource)
        .subscribe(fail, error =>
          expect(error.message).toEqual('You can not delete a resource without type')
        );

      httpMock.expectNone(`http://www.fake.com/${resource.type}/${resource.id}`);
    });

    it('should fail with a resource without id', () => {
      const resource = new Foo();

      service
        .delete(resource)
        .subscribe(fail, error =>
          expect(error.message).toEqual('You can not delete a resource without id')
        );

      httpMock.expectNone(`http://www.fake.com/${resource.type}/${resource.id}`);
    });

    it('should send a DELETE request', () => {
      const resource = new Foo({ id: '1' });

      service.delete(resource).subscribe();
      const mock = httpMock.expectOne(`http://www.fake.com/${resource.type}/${resource.id}`);
      expect(mock.cancelled).toBeFalsy();
      expect(mock.request.method).toBe('DELETE');
      expect(mock.request.body).toBeFalsy();
    });
  });

  describe('getting relationship', () => {
    it('should fail with a resource without type', () => {
      const resource = new JsonApiResource();

      service
        .getRelationship(resource, name)
        .subscribe(fail, error =>
          expect(error.message).toEqual('You can not get relationship a resource without type')
        );

      httpMock.expectNone(
        `http://www.fake.com/${resource.type}/${resource.id}/relationships/${name}`
      );
    });

    it('should fail with a resource without id', () => {
      const resource = new Foo();

      service
        .getRelationship(resource, name)
        .subscribe(fail, error =>
          expect(error.message).toEqual('You can not get relationship a resource without id')
        );

      httpMock.expectNone(
        `http://www.fake.com/${resource.type}/${resource.id}/relationships/${name}`
      );
    });

    it('should send a GET request that returns a document with a single Identifier', () => {
      const resource = new Foo({ id: '1' });

      service.getRelationship(resource, name).subscribe();
      const mock = httpMock.expectOne(
        `http://www.fake.com/${resource.type}/${resource.id}/relationships/${name}`
      );
      expect(mock.cancelled).toBeFalsy();
      expect(mock.request.method).toBe('GET');
      mock.flush({
        data: { id: resource.id, type: resource.type, meta: resource.meta }
      });
    });
  });

  describe('getting relationships', () => {
    it('should fail with a resource without type', () => {
      const resource = new JsonApiResource();

      service
        .getRelationships(resource, name)
        .subscribe(fail, error =>
          expect(error.message).toEqual('You can not get relationships of a resource without type')
        );

      httpMock.expectNone(
        `http://www.fake.com/${resource.type}/${resource.id}/relationships/${name}`
      );
    });

    it('should fail with a resource without id', () => {
      const resource = new Foo();

      service
        .getRelationships(resource, name)
        .subscribe(fail, error =>
          expect(error.message).toEqual('You can not get relationships of a resource without id')
        );

      httpMock.expectNone(
        `http://www.fake.com/${resource.type}/${resource.id}/relationships/${name}`
      );
    });

    it('should send a GET request that returns a document with many identifiers', () => {
      const resource = new Foo({ id: '1' });
      const result = {
        data: [{ id: resource.id, type: resource.type, meta: resource.meta }]
      };

      service.getRelationships(resource, name).subscribe();
      const mock = httpMock.expectOne(
        `http://www.fake.com/${resource.type}/${resource.id}/relationships/${name}`
      );
      expect(mock.cancelled).toBeFalsy();
      expect(mock.request.method).toBe('GET');
      mock.flush(result);
    });
  });

  describe('updating to-one relationships', () => {
    const name = 'rel';
    const relationship = new Foo({ id: '2' });

    it('should fail with a resource without type', () => {
      const resource = new JsonApiResource();

      service
        .updateRelationship(resource, name, relationship)
        .subscribe(fail, error =>
          expect(error.message).toEqual(
            'You can not update relationship of a resource without type'
          )
        );

      httpMock.expectNone(
        `http://www.fake.com/${resource.type}/${resource.id}/relationships/${name}`
      );
    });

    it('should fail with a resource without id', () => {
      const resource = new Foo();

      service
        .updateRelationship(resource, name, relationship)
        .subscribe(fail, error =>
          expect(error.message).toEqual('You can not update relationship of a resource without id')
        );

      httpMock.expectNone(
        `http://www.fake.com/${resource.type}/${resource.id}/relationships/${name}`
      );
    });

    it('should send a PATCH request and replace the to-one relationship', () => {
      const resource = new Foo({ id: '1' });

      service.updateRelationship(resource, name, relationship).subscribe(() => {
        expect(resource[name]).toEqual(relationship);
      });
      const mock = httpMock.expectOne(
        `http://www.fake.com/${resource.type}/${resource.id}/relationships/${name}`
      );
      expect(mock.cancelled).toBeFalsy();
      expect(mock.request.method).toBe('PATCH');
      mock.flush({
        data: { id: relationship.id, type: relationship.type, meta: relationship.meta }
      });
    });
  });

  describe('updating to-many relationships', () => {
    const name = 'rels';
    const relationships = [new Foo({ id: '2' })];

    it('should fail with a resource without type', () => {
      const resource = new JsonApiResource();

      service
        .updateRelationships(resource, name, relationships)
        .subscribe(fail, error =>
          expect(error.message).toEqual(
            'You can not update relationships of a resource without type'
          )
        );
      httpMock.expectNone(
        `http://www.fake.com/${resource.type}/${resource.id}/relationships/${name}`
      );
    });

    it('should fail with a resource without id', () => {
      const resource = new Foo();

      service
        .updateRelationships(resource, name, relationships)
        .subscribe(fail, error =>
          expect(error.message).toEqual('You can not update relationships of a resource without id')
        );
      httpMock.expectNone(
        `http://www.fake.com/${resource.type}/${resource.id}/relationships/${name}`
      );
    });

    it('should send a PATCH request and replace the to-many relationship', () => {
      const resource = new Foo({ id: '1' });

      service.updateRelationships(resource, name, relationships).subscribe(() => {
        expect(resource[name]).toEqual(relationships);
      });
      const mock = httpMock.expectOne(
        `http://www.fake.com/${resource.type}/${resource.id}/relationships/${name}`
      );
      expect(mock.cancelled).toBeFalsy();
      expect(mock.request.method).toBe('PATCH');
    });
  });

  describe('saving a to-many relationships', () => {
    const name = 'rels';
    const relationships = [new Foo({ id: '1' })];

    it('should fail with a resource without type', () => {
      const resource = new JsonApiResource();
      service
        .saveRelationships(resource, name, relationships)
        .subscribe(fail, error =>
          expect(error.message).toEqual('You can not save relationships of a resource without type')
        );
      httpMock.expectNone(
        `http://www.fake.com/${resource.type}/${resource.id}/relationships/${name}`
      );
    });

    it('should fail with a resource without id', () => {
      const resource = new Foo();

      service
        .saveRelationships(resource, name, relationships)
        .subscribe(fail, error =>
          expect(error.message).toEqual('You can not save relationships of a resource without id')
        );
      httpMock.expectNone(
        `http://www.fake.com/${resource.type}/${resource.id}/relationships/${name}`
      );
    });

    it('should send a POST request and modify the to-many relationship', () => {
      const resource = new Foo({ id: '1' });

      resource[name] = [new Foo({ id: '2' })];

      service.saveRelationships(resource, name, relationships).subscribe(() => {
        expect(resource[name]).toContain(relationships[0]);
      });
      const mock = httpMock.expectOne(
        `http://www.fake.com/${resource.type}/${resource.id}/relationships/${name}`
      );
      expect(mock.cancelled).toBeFalsy();
      expect(mock.request.method).toBe('POST');
    });
  });

  describe('deleting a relationships', () => {
    const name = 'something';
    const relationships = [new Foo({ id: '1' })];

    it('should fail with a resource without type', () => {
      const resource = new JsonApiResource();

      service
        .deleteRelationships(resource, name, relationships)
        .subscribe(fail, error =>
          expect(error.message).toEqual(
            'You can not delete relationships of a resource without type'
          )
        );
      httpMock.expectNone(
        `http://www.fake.com/${resource.type}/${resource.id}/relationships/${name}`
      );
    });

    it('should fail with a resource without id', () => {
      const resource = new Foo();

      service
        .deleteRelationships(resource, name, relationships)
        .subscribe(fail, error =>
          expect(error.message).toEqual('You can not delete relationships of a resource without id')
        );
      httpMock.expectNone(
        `http://www.fake.com/${resource.type}/${resource.id}/relationships/${name}`
      );
    });

    it('should send a DELETE request and remove deleted relationships', () => {
      const resource = new Foo({ id: '1' });

      resource[name] = relationships;

      service.deleteRelationships(resource, name, relationships).subscribe(() => {
        expect(resource[name]).not.toContain(relationships[0]);
      });
      const mock = httpMock.expectOne(
        `http://www.fake.com/${resource.type}/${resource.id}/relationships/${name}`
      );
      expect(mock.cancelled).toBeFalsy();
      expect(mock.request.method).toBe('DELETE');
    });
  });
});
