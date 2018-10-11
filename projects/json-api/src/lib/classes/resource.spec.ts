import { Resource } from './resource';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { JsonApiParametersService } from '../json-api-parameters.service';
import { HttpClient } from '@angular/common/http';
import { JsonApiModule } from '../json-api.module';
import { JSON_API_VERSION } from '../json-api-version';
import { JSON_API_URL } from '../json-api-url';
import { JsonDocumentResource } from '../interfaces/json-document-resource';
import { JsonDocumentIdentifier } from '../interfaces/json-document-identifier';
import { JsonDocumentIdentifiers } from '../interfaces/json-document-identifiers';
import { JsonApiRegisterService } from '../json-api-register.service';
import { DocumentResource } from './document-resource';
import { DocumentErrors } from './document-errors';
import { DocumentIdentifiers } from './document-identifiers';
import { DocumentIdentifier } from './document-identifier';

const version = 'test.v0';
const url = 'http://fake.api.url';
const toOneRelationshipName = 'foo';
const toManyRelationshipName = 'foos';
const fakeDocumentResource: JsonDocumentResource = {
  data: {
    id: '1', type: 'fake', attributes: {
      foo: true,
      fake: [1, 2, 3]
    }, relationships: {}, meta: {}, links: {}
  },
  meta: {},
  included: [],
  links: {},
  jsonapi: {
    version,
    meta: {}
  }
};

const fakeDocumentIdentifier: JsonDocumentIdentifier = {
  data: { id: '2', type: 'fake' },
  meta: {},
  links: {},
  jsonapi: {
    version,
    meta: {}
  }
};

const fakeDocumentIdentifiers: JsonDocumentIdentifiers = {
  data: [
    { id: '2', type: 'fake' },
    { id: '3', type: 'fake' }
  ],
  meta: {},
  links: {},
  jsonapi: {
    version,
    meta: {}
  }
};

describe('Resource', () => {
  let httpMock: HttpTestingController;
  let resource: Resource;

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
          provide: JsonApiRegisterService,
          useValue: registerService
        },
        {
          provide: JsonApiParametersService,
          useValue: parametersService
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
    registerService.get.calls.reset();
    parametersService.httpParams.calls.reset();
  });

  beforeEach(() => {
    resource = new Resource(null, 'fake', null, {
      foo: true,
      fake: [1, 2, 3]
    }, {
        [toOneRelationshipName]: {
          data: new Resource('2', 'fake'),
          links: null
        },
        [toManyRelationshipName]: {
          data: [
            new Resource('2', 'fake'),
            new Resource('3', 'fake')
          ],
          links: null
        }
      }, null);
  });

  afterEach(() => httpMock.verify());

  describe('save', () => {
    let request: TestRequest;

    it('should return a DocumentErrors when failed', (done) => {
      resource.save().subscribe(
        () => done.fail('should not succeed'),
        err => {
          expect(err).toEqual(jasmine.any(DocumentErrors));
          done();
        }
      );
      request = httpMock.expectOne(`${url}/${resource.type}`);
      expect(request.cancelled).toBeFalsy();
      request.error(new ErrorEvent('Save failed'));
    });

    describe('without id', () => {
      beforeEach(() => {
        resource.save().subscribe(res => expect(res).toEqual(jasmine.any(DocumentResource)));
        request = httpMock.expectOne(`${url}/${resource.type}`);
        expect(request.cancelled).toBeFalsy();
        request.flush(fakeDocumentResource);
      });

      it('should send post request', () => {
        expect(request.request.method).toBe('POST');
        expect(request.request.responseType).toEqual('json');
      });

      it('should send body with type, attributes and relationships identifiers through data object', () => {
        expect(request.request.body).toBeTruthy();
        expect(request.request.body.data).toEqual({
          type: resource.type,
          attributes: resource.attributes,
          relationships: resource.relationshipsIdentifiers
        });
      });

      it('should call httpParams method of parametersService', () => {
        expect(parametersService.httpParams).toHaveBeenCalled();
      });

      it('should call get method of registerService', () => {
        expect(registerService.get).toHaveBeenCalled();
      });

      it('should not set resource as deleted', () => {
        expect(resource.deleted).toBeFalsy();
      });

      it('should update resource id', () => {
        expect(resource.id).toEqual(fakeDocumentResource.data.id);
      });

      it('should update resource attributes', () => {
        expect(resource.attributes).toEqual(fakeDocumentResource.data.attributes);
      });
    });

    describe('with id', () => {
      beforeEach(() => {
        resource.id = '1';
        resource.save().subscribe(res => expect(res).toEqual(jasmine.any(DocumentResource)));
        request = httpMock.expectOne(`${url}/${resource.type}`);
        expect(request.cancelled).toBeFalsy();
        request.flush(fakeDocumentResource);
      });

      it('should send post request', () => {
        expect(request.request.method).toBe('POST');
        expect(request.request.responseType).toEqual('json');
      });

      it('should send body with id, type, attributes and relationships identifiers through data object', () => {
        expect(request.request.body).toBeTruthy();
        expect(request.request.body.data).toEqual({
          id: resource.id,
          type: resource.type,
          attributes: resource.attributes,
          relationships: resource.relationshipsIdentifiers
        });
      });

      it('should call httpParams method of parametersService', () => {
        expect(parametersService.httpParams).toHaveBeenCalled();
      });

      it('should call get method of registerService', () => {
        expect(registerService.get).toHaveBeenCalled();
      });

      it('should not set resource as deleted', () => {
        expect(resource.deleted).toBeFalsy();
      });

      it('should update resource id', () => {
        expect(resource.id).toEqual(fakeDocumentResource.data.id);
      });

      it('should update resource attributes', () => {
        expect(resource.attributes).toEqual(fakeDocumentResource.data.attributes);
      });
    });
  });

  describe('update', () => {
    let request: TestRequest;

    beforeEach(() => resource.id = '1');

    it('should return a DocumentErrors when failed', (done) => {
      resource.update().subscribe(
        () => done.fail('should not succeed'),
        err => {
          expect(err).toEqual(jasmine.any(DocumentErrors));
          done();
        }
      );
      request = httpMock.expectOne(`${url}/${resource.type}/${resource.id}`);
      expect(request.cancelled).toBeFalsy();
      request.error(new ErrorEvent('Update failed'));
    });

    beforeEach(() => {
      resource.update().subscribe(res => expect(res).toEqual(jasmine.any(DocumentResource)));
      request = httpMock.expectOne(`${url}/${resource.type}/${resource.id}`);
      expect(request.cancelled).toBeFalsy();
      request.flush(fakeDocumentResource);
    });

    it('should send patch request', () => {
      expect(request.request.method).toBe('PATCH');
      expect(request.request.responseType).toEqual('json');
    });

    it('should send body with id, type, attributes and relationships identifiers through data object', () => {
      expect(request.request.body).toBeTruthy();
      expect(request.request.body.data).toEqual({
        id: resource.id,
        type: resource.type,
        attributes: resource.attributes,
        relationships: resource.relationshipsIdentifiers
      });
    });

    it('should call httpParams method of parametersService', () => {
      expect(parametersService.httpParams).toHaveBeenCalled();
    });

    it('should call get method of registerService', () => {
      expect(registerService.get).toHaveBeenCalled();
    });

    it('should not set resource as deleted', () => {
      expect(resource.deleted).toBeFalsy();
    });

    it('should update resource id', () => {
      expect(resource.id).toEqual(fakeDocumentResource.data.id);
    });

    it('should update resource attributes', () => {
      expect(resource.attributes).toEqual(fakeDocumentResource.data.attributes);
    });
  });

  describe('delete', () => {
    let request: TestRequest;

    beforeEach(() => resource.id = '1');

    it('should return a DocumentErrors when failed', (done) => {
      resource.delete().subscribe(
        () => done.fail('should not succeed'),
        err => {
          expect(err).toEqual(jasmine.any(DocumentErrors));
          done();
        }
      );
      request = httpMock.expectOne(`${url}/${resource.type}/${resource.id}`);
      expect(request.cancelled).toBeFalsy();
      request.error(new ErrorEvent('Delete failed'));
    });

    beforeEach(() => {
      resource.delete().subscribe(res => expect(res).toBeNull());
      request = httpMock.expectOne(`${url}/${resource.type}/${resource.id}`);
      expect(request.cancelled).toBeFalsy();
      request.flush(null);
    });

    it('should send delete request', () => {
      expect(request.request.method).toBe('DELETE');
      expect(request.request.responseType).toEqual('json');
    });

    it('should not send body', () => {
      expect(request.request.body).toBeFalsy();
    });

    it('should not call httpParams method of parametersService', () => {
      expect(parametersService.httpParams).not.toHaveBeenCalled();
    });

    it('should not call get method of registerService', () => {
      expect(registerService.get).not.toHaveBeenCalled();
    });

    it('should set resource as deleted', () => {
      expect(resource.deleted).toBeTruthy();
    });
  });

  describe('get to-one relationship', () => {
    let request: TestRequest;

    beforeEach(() => resource.id = '1');

    it('should return a DocumentErrors when failed', (done) => {
      resource.getRelationship(toOneRelationshipName).subscribe(
        () => done.fail('should not succeed'),
        err => {
          expect(err).toEqual(jasmine.any(DocumentErrors));
          done();
        }
      );
      request = httpMock.expectOne(`${url}/${resource.type}/${resource.id}/relationships/${toOneRelationshipName}`);
      expect(request.cancelled).toBeFalsy();
      request.error(new ErrorEvent('Get failed'));
    });

    beforeEach(() => {
      resource.getRelationship(toOneRelationshipName).subscribe(res => expect(res).toEqual(jasmine.any(DocumentIdentifier)));
      request = httpMock.expectOne(`${url}/${resource.type}/${resource.id}/relationships/${toOneRelationshipName}`);
      expect(request.cancelled).toBeFalsy();
      request.flush(fakeDocumentIdentifier);
    });

    it('should send get request', () => {
      expect(request.request.method).toBe('GET');
      expect(request.request.responseType).toEqual('json');
    });

    it('should not send body', () => {
      expect(request.request.body).toBeFalsy();
    });

    it('should not call httpParams method of parametersService', () => {
      expect(parametersService.httpParams).not.toHaveBeenCalled();
    });

    it('should not call get method of registerService', () => {
      expect(registerService.get).not.toHaveBeenCalled();
    });

    it('should not set resource as deleted', () => {
      expect(resource.deleted).toBeFalsy();
    });
  });

  describe('get to-many relationships', () => {
    let request: TestRequest;

    beforeEach(() => resource.id = '1');

    it('should return a DocumentErrors when failed', (done) => {
      resource.getRelationships(toManyRelationshipName).subscribe(
        () => done.fail('should not succeed'),
        err => {
          expect(err).toEqual(jasmine.any(DocumentErrors));
          done();
        }
      );
      request = httpMock.expectOne(`${url}/${resource.type}/${resource.id}/relationships/${toManyRelationshipName}`);
      expect(request.cancelled).toBeFalsy();
      request.error(new ErrorEvent('Get failed'));
    });

    beforeEach(() => {
      resource.getRelationships(toManyRelationshipName).subscribe(res => expect(res).toEqual(jasmine.any(DocumentIdentifiers)));
      request = httpMock.expectOne(`${url}/${resource.type}/${resource.id}/relationships/${toManyRelationshipName}`);
      expect(request.cancelled).toBeFalsy();
      request.flush(fakeDocumentIdentifiers);
    });

    it('should send get request', () => {
      expect(request.request.method).toBe('GET');
      expect(request.request.responseType).toEqual('json');
    });

    it('should not send body', () => {
      expect(request.request.body).toBeFalsy();
    });

    it('should not call httpParams method of parametersService', () => {
      expect(parametersService.httpParams).not.toHaveBeenCalled();
    });

    it('should not call get method of registerService', () => {
      expect(registerService.get).not.toHaveBeenCalled();
    });

    it('should not set resource as deleted', () => {
      expect(resource.deleted).toBeFalsy();
    });
  });

  describe('update to-one relationship', () => {
    const newRelationship = new Resource('4', 'fake');

    let request: TestRequest;

    beforeEach(() => resource.id = '1');

    it('should return a DocumentErrors when failed', (done) => {
      resource.updateRelationship(toOneRelationshipName, newRelationship).subscribe(
        () => done.fail('should not succeed'),
        err => {
          expect(err).toEqual(jasmine.any(DocumentErrors));
          done();
        }
      );
      request = httpMock.expectOne(`${url}/${resource.type}/${resource.id}/relationships/${toOneRelationshipName}`);
      expect(request.cancelled).toBeFalsy();
      request.error(new ErrorEvent('Get failed'));
    });

    beforeEach(() => {
      resource.updateRelationship(toOneRelationshipName, newRelationship)
        .subscribe(res => expect(res).toEqual(jasmine.any(DocumentIdentifier)));
      request = httpMock.expectOne(`${url}/${resource.type}/${resource.id}/relationships/${toOneRelationshipName}`);
      expect(request.cancelled).toBeFalsy();
      request.flush(fakeDocumentIdentifier);
    });

    it('should send patch request', () => {
      expect(request.request.method).toBe('PATCH');
      expect(request.request.responseType).toEqual('json');
    });

    it('should send body with new relationship id and type through data object', () => {
      expect(request.request.body).toBeTruthy();
      expect(request.request.body.data).toEqual({
        id: newRelationship.id,
        type: newRelationship.type
      });
    });

    it('should not call httpParams method of parametersService', () => {
      expect(parametersService.httpParams).not.toHaveBeenCalled();
    });

    it('should not call get method of registerService', () => {
      expect(registerService.get).not.toHaveBeenCalled();
    });

    it('should not set resource as deleted', () => {
      expect(resource.deleted).toBeFalsy();
    });

    it('should replace the resource by the new one', () => {
      expect(resource.relationships[toOneRelationshipName].data).toEqual(newRelationship);
      expect(resource.relationships[toOneRelationshipName].links).toEqual(fakeDocumentIdentifier.links);
    });
  });

  describe('update to-many relationships', () => {
    const newRelationships = [
      new Resource('3', 'fake'),
      new Resource('4', 'fake')
    ];

    let request: TestRequest;

    beforeEach(() => resource.id = '1');

    it('should return a DocumentErrors when failed', (done) => {
      resource.updateRelationships(toManyRelationshipName, newRelationships).subscribe(
        () => done.fail('should not succeed'),
        err => {
          expect(err).toEqual(jasmine.any(DocumentErrors));
          done();
        }
      );
      request = httpMock.expectOne(`${url}/${resource.type}/${resource.id}/relationships/${toManyRelationshipName}`);
      expect(request.cancelled).toBeFalsy();
      request.error(new ErrorEvent('Get failed'));
    });

    beforeEach(() => {
      resource.updateRelationships(toManyRelationshipName, newRelationships)
        .subscribe(res => expect(res).toEqual(jasmine.any(DocumentIdentifiers)));
      request = httpMock.expectOne(`${url}/${resource.type}/${resource.id}/relationships/${toManyRelationshipName}`);
      expect(request.cancelled).toBeFalsy();
      request.flush(fakeDocumentIdentifiers);
    });

    it('should send patch request', () => {
      expect(request.request.method).toBe('PATCH');
      expect(request.request.responseType).toEqual('json');
    });

    it('should send body with new relationships ids and types through data object', () => {
      expect(request.request.body).toBeTruthy();
      request.request.body.data.map((data, index) => {
        expect(data).toEqual({
          id: newRelationships[index].id,
          type: newRelationships[index].type
        });
      });
    });

    it('should not call httpParams method of parametersService', () => {
      expect(parametersService.httpParams).not.toHaveBeenCalled();
    });

    it('should not call get method of registerService', () => {
      expect(registerService.get).not.toHaveBeenCalled();
    });

    it('should not set resource as deleted', () => {
      expect(resource.deleted).toBeFalsy();
    });

    it('should replace the resources by the new ones', () => {
      expect(resource.relationships[toManyRelationshipName].data).toEqual(newRelationships);
      expect(resource.relationships[toManyRelationshipName].links).toEqual(fakeDocumentIdentifier.links);
    });
  });

  describe('save relationships', () => {
    const addedRelationships = [
      new Resource('3', 'fake'),
      new Resource('4', 'fake')
    ];

    let request: TestRequest;

    beforeEach(() => resource.id = '1');

    it('should return a DocumentErrors when failed', (done) => {
      resource.saveRelationships(toManyRelationshipName, addedRelationships).subscribe(
        () => done.fail('should not succeed'),
        err => {
          expect(err).toEqual(jasmine.any(DocumentErrors));
          done();
        }
      );
      request = httpMock.expectOne(`${url}/${resource.type}/${resource.id}/relationships/${toManyRelationshipName}`);
      expect(request.cancelled).toBeFalsy();
      request.error(new ErrorEvent('Get failed'));
    });

    beforeEach(() => {
      resource.saveRelationships(toManyRelationshipName, addedRelationships)
        .subscribe(res => expect(res).toEqual(jasmine.any(DocumentIdentifiers)));
      request = httpMock.expectOne(`${url}/${resource.type}/${resource.id}/relationships/${toManyRelationshipName}`);
      expect(request.cancelled).toBeFalsy();
      request.flush(fakeDocumentIdentifiers);
    });

    it('should send post request', () => {
      expect(request.request.method).toBe('POST');
      expect(request.request.responseType).toEqual('json');
    });

    it('should send body with new relationships ids and types through data object', () => {
      expect(request.request.body).toBeTruthy();
      request.request.body.data.map((data, index) => {
        expect(data).toEqual({
          id: addedRelationships[index].id,
          type: addedRelationships[index].type
        });
      });
    });

    it('should not call httpParams method of parametersService', () => {
      expect(parametersService.httpParams).not.toHaveBeenCalled();
    });

    it('should not call get method of registerService', () => {
      expect(registerService.get).not.toHaveBeenCalled();
    });

    it('should not set resource as deleted', () => {
      expect(resource.deleted).toBeFalsy();
    });

    it('should add the added resources into relationships list', () => {
      const newRelationships = resource.relationships[toManyRelationshipName].data as Resource[];
      addedRelationships.map(relationship => expect(newRelationships).toContain(relationship));
      expect(resource.relationships[toManyRelationshipName].links).toEqual(fakeDocumentIdentifiers.links);
    });
  });

  describe('delete relationships', () => {
    const deletedRelationships = [
      new Resource('3', 'fake')
    ];

    let request: TestRequest;

    beforeEach(() => resource.id = '1');

    it('should return a DocumentErrors when failed', (done) => {
      resource.deleteRelationships(toManyRelationshipName, deletedRelationships).subscribe(
        () => done.fail('should not succeed'),
        err => {
          expect(err).toEqual(jasmine.any(DocumentErrors));
          done();
        }
      );
      request = httpMock.expectOne(`${url}/${resource.type}/${resource.id}/relationships/${toManyRelationshipName}`);
      expect(request.cancelled).toBeFalsy();
      request.error(new ErrorEvent('Get failed'));
    });

    beforeEach(() => {
      resource.deleteRelationships(toManyRelationshipName, deletedRelationships)
        .subscribe(res => expect(res).toBeNull());
      request = httpMock.expectOne(`${url}/${resource.type}/${resource.id}/relationships/${toManyRelationshipName}`);
      expect(request.cancelled).toBeFalsy();
      request.flush(null);
    });

    it('should send delete request', () => {
      expect(request.request.method).toBe('DELETE');
      expect(request.request.responseType).toEqual('json');
    });

    it('should send body with new relationships ids and types through data object', () => {
      expect(request.request.body).toBeTruthy();
      request.request.body.data.map((data, index) => {
        expect(data).toEqual({
          id: deletedRelationships[index].id,
          type: deletedRelationships[index].type
        });
      });
    });

    it('should not call httpParams method of parametersService', () => {
      expect(parametersService.httpParams).not.toHaveBeenCalled();
    });

    it('should not call get method of registerService', () => {
      expect(registerService.get).not.toHaveBeenCalled();
    });

    it('should not set resource as deleted', () => {
      expect(resource.deleted).toBeFalsy();
    });

    it('should remove the removed relationship from relationships list', () => {
      const newRelationships = resource.relationships[toManyRelationshipName].data as Resource[];
      deletedRelationships.map(relationship => expect(newRelationships).not.toContain(relationship));
    });
  });
});
