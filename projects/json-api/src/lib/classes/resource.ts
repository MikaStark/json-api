import { Observable, throwError } from 'rxjs';
import { DocumentResource } from '../classes/document-resource';
import { DocumentCollection } from '../classes/document-collection';
import { catchError, tap, map } from 'rxjs/operators';
import { JsonApiService as JsonApi } from '../json-api.service';
import { Attributes } from '../interfaces/attributes';
import { Relationships } from '../interfaces/relationships';
import { Links } from '../interfaces/links';
import { Parameters } from '../interfaces/parameters';
import { Document } from '../classes/document';
import { ResourceTypes } from '../interfaces/resource-types';
import { Identifier } from './identifier';
import { Meta } from '../interfaces';
import { DocumentError } from './document-error';
import { DocumentIdentifier } from './document-identifier';
import { DocumentIdentifiers } from './document-identifiers';

export class Resource extends Identifier {

  private static types: ResourceTypes = {};

  private _deleted = false;

  public attributes: Attributes;
  public relationships: Relationships;
  public meta: Meta;
  public links: Links;

  private static findRelationship(identifier: Identifier, document: Document): Resource {
    const data = document.data as Resource|Resource[];
    let relationship = document.included
      .concat(data || [])
      .find(included => included.id === identifier.id && included.type === identifier.type);
    if (!relationship) {
      relationship = new Resource(identifier.id, identifier.type);
      relationship.meta = identifier.meta;
    }
    return relationship;
  }

  private static populate(resource: Resource, document: Document): void {
    for (const name in resource.relationships) {
      if (Array.isArray(resource.relationships[name].data)) {
        const relationships = resource.relationships[name] as DocumentCollection;
        relationships.data = relationships.data.map(data => this.findRelationship(data, document));
      } else {
        const relationship = resource.relationships[name] as DocumentResource;
        relationship.data = this.findRelationship(relationship.data, document);
      }
    }
  }

  private static relationships(data: Relationships): Relationships {
    const relationships: Relationships = {};
    for (const name in data) {
      if (Array.isArray(data[name].data)) {
        relationships[name] = this.createDocumentCollection(data[name] as DocumentCollection);
      } else {
        relationships[name] = this.createDocumentResource(data[name] as DocumentResource);
      }
    }
    return relationships;
  }

  static createDocumentIdentifier(document: DocumentIdentifier): DocumentIdentifier {
    const data = new Identifier(document.data.id, document.data.type);
    data.meta = document.data.meta;
    const documentIdentifier = new DocumentIdentifier(data, document.meta);
    documentIdentifier.links = document.links;
    documentIdentifier.jsonapi = document.jsonapi;
    return documentIdentifier;
  }

  static createDocumentIdentifiers(document: DocumentIdentifiers): DocumentIdentifiers {
    const documentIdentifiers = new DocumentIdentifiers(
      document.data.map(resource => {
        const data = new Identifier(resource.id, resource.type);
        data.meta = resource.meta;
        return data;
      }),
      document.meta
    );
    documentIdentifiers.links = document.links;
    documentIdentifiers.jsonapi = document.jsonapi;
    return documentIdentifiers;
  }

  static createDocumentResource(document: DocumentResource): DocumentResource {
    const data = this.create(document.data.id, document.data.type);
    data.attributes = document.data.attributes;
    data.relationships = this.relationships(document.data.relationships);
    data.links = document.data.links;
    data.meta = document.data.meta;
    const documentResource = new DocumentResource(data, document.meta);
    documentResource.links = document.links;
    documentResource.jsonapi = document.jsonapi;
    if (document.included) {
      documentResource.included = document.included.map(resource => {
        const includedData = this.create(resource.id, resource.type);
        includedData.attributes = resource.attributes;
        includedData.relationships = this.relationships(resource.relationships);
        includedData.links = resource.links;
        includedData.meta = resource.meta;
        return includedData;
      });
      documentResource.included.map(resource => this.populate(resource, documentResource));
      this.populate(documentResource.data, documentResource);
    }
    return documentResource;
  }

  static createDocumentCollection(document: DocumentCollection): DocumentCollection {
    const documentCollection = new DocumentCollection(
      document.data.map(resource => {
        const data = this.create(resource.id, resource.type);
        data.attributes = resource.attributes;
        data.relationships = this.relationships(resource.relationships);
        data.links = resource.links;
        data.meta = resource.meta;
        return data;
      }),
      document.meta
    );
    documentCollection.links = document.links;
    documentCollection.jsonapi = document.jsonapi;
    if (document.included) {
      documentCollection.included = document.included.map(resource => {
        const includedData = this.create(resource.id, resource.type);
        includedData.attributes = resource.attributes;
        includedData.relationships = this.relationships(resource.relationships);
        includedData.links = resource.links;
        includedData.meta = resource.meta;
        return includedData;
      });
      documentCollection.included.map(resource => this.populate(resource, documentCollection));
      documentCollection.data.map(resource => this.populate(resource, documentCollection));
    }
    return documentCollection;
  }

  static create(id: string, type: string): Resource {
    const resourceType = this.types[type];
    if (resourceType) {
      return new resourceType(id, type);
    }
    return new Resource(id, type);
  }

  static register(name: string, type: typeof Resource): void {
    this.types[name] = type;
  }

  get deleted(): boolean {
    return this._deleted;
  }

  private get url(): string {
    return `${JsonApi.url}/${this.type}`;
  }

  save(params?: Parameters): Observable<DocumentResource> {
    const body: any = {
      data: {
        type: this.type,
        attributes: this.attributes
      }
    };
    if (this.id) {
      body.data.id = this.id;
    }
    return JsonApi.http.post<DocumentResource>(this.url, body, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => Resource.createDocumentResource(document)),
      tap(document => {
        this.id = document.data.id;
        this.attributes = document.data.attributes;
      })
    );
  }

  update(params?: Parameters): Observable<DocumentResource> {
    const body = {
      data: {
        type: this.type,
        id: this.id,
        attributes: this.attributes
      }
    };
    return JsonApi.http.patch<DocumentResource>(`${this.url}/${this.id}`, body, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => Resource.createDocumentResource(document)),
      tap(document => {
        this.id = document.data.id;
        this.attributes = document.data.attributes;
      })
    );
  }

  delete(): Observable<void> {
    return JsonApi.http.delete<void>(`${this.url}/${this.id}`).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      tap(() => this._deleted = true)
    );
  }

  getRelationship(name: string): Observable<DocumentIdentifier> {
    return JsonApi.http.get<DocumentIdentifier>(`${this.url}/${this.id}/relationships/${name}`).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => Resource.createDocumentIdentifier(document))
    );
  }

  getRelationships(name: string): Observable<DocumentIdentifiers> {
    return JsonApi.http.get<DocumentIdentifiers>(`${this.url}/${this.id}/relationships/${name}`).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => Resource.createDocumentIdentifiers(document))
    );
  }

  updateRelationship(name: string, params?: Parameters): Observable<DocumentResource> {
    const relationship = this.relationships[name] as DocumentResource;
    const identifier = new Identifier(relationship.data.id, relationship.data.type);
    return JsonApi.http.patch<DocumentResource>(`${this.url}/${this.id}/relationships/${name}`, identifier, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => Resource.createDocumentResource(document)),
      tap(document => this.relationships[name] = document)
    );
  }

  updateRelationships(name: string, params?: Parameters): Observable<DocumentCollection> {
    const relationship = this.relationships[name] as DocumentCollection;
    const identifiers = relationship.data.map(resource => new Identifier(resource.id, resource.type));
    return JsonApi.http.patch<DocumentCollection>(`${this.url}/${this.id}/relationships/${name}`, identifiers, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => Resource.createDocumentCollection(document)),
      tap(document => this.relationships[name] = document)
    );
  }

  saveRelationships(
    name: string,
    relationships: Identifier[],
    params?: Parameters
  ): Observable<DocumentCollection> {
    return JsonApi.http.post<DocumentCollection>(`${this.url}/${this.id}/relationships/${name}`, {
      data: relationships
    }, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => Resource.createDocumentCollection(document)),
      tap(document => {
        const savedRelationshipsIds = document.data.map(relationship => relationship.id);
        const collection = this.relationships[name] as DocumentCollection;
        this.relationships[name].data = collection.data
          .filter(relationship => !savedRelationshipsIds.includes(relationship.id))
          .concat(document.data);
      })
    );
  }

  deleteRelationships(name: string, relationships: Identifier[]): Observable<void> {
    const body = {
      data: relationships
    };
    return JsonApi.http.request<void>('delete', `${this.url}/${this.id}/relationships/${name}`, { body }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      tap(() => {
        const deletedRelationshipsIds = body.data.map(relationship => relationship.id);
        const collection = this.relationships[name] as DocumentCollection;
        this.relationships[name].data = collection.data
          .filter(relationship => !deletedRelationshipsIds.includes(relationship.id));
      })
    );
  }
}
