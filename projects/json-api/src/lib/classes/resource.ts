import { Observable, throwError } from 'rxjs';
import { DocumentResource } from '../classes/document-resource';
import { DocumentResources } from './document-resources';
import { catchError, tap, map } from 'rxjs/operators';
import { JsonApiService as JsonApi } from '../json-api.service';
import { Attributes } from '../interfaces/attributes';
import { Links } from '../interfaces/links';
import { Parameters } from '../interfaces/parameters';
import { Document } from '../classes/document';
import { ResourceTypes } from '../interfaces/resource-types';
import { Identifier } from './identifier';
import { Meta } from '../interfaces/meta';
import { DocumentError } from './document-error';
import { DocumentIdentifier } from './document-identifier';
import { DocumentIdentifiers } from './document-identifiers';
import { Relationships } from '../interfaces/relationships';
import { Relationship } from '../interfaces/relationship';

export class Resource extends Identifier {

  private static types: ResourceTypes = {};

  private _deleted = false;

  public attributes: Attributes;
  public relationships: {[name: string]: Relationships|Relationship};
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
        const relationships = resource.relationships[name].data as Resource[];
        resource.relationships[name].data = relationships.map(data => this.findRelationship(data, document));
      } else {
        const relationship = resource.relationships[name].data as Resource;
        resource.relationships[name].data = this.findRelationship(relationship, document);
      }
    }
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
    data.links = document.data.links;
    data.meta = document.data.meta;

    const documentResource = new DocumentResource(data, document.meta);

    if (document.included) {
      documentResource.included = document.included.map(resource => {
        const includedData = this.create(resource.id, resource.type);
        includedData.attributes = resource.attributes;
        includedData.links = resource.links;
        includedData.meta = resource.meta;
        if (resource.relationships) {
          includedData.relationships = resource.relationships;
        }
        return includedData;
      });
      documentResource.included.map(resource => this.populate(resource, documentResource));
    }

    if (document.data.relationships) {
      data.relationships = document.data.relationships;
      this.populate(data, documentResource);
    }

    documentResource.links = document.links;
    documentResource.jsonapi = document.jsonapi;
    return documentResource;
  }

  static createDocumentResources(document: DocumentResources): DocumentResources {
    const documentCollection = new DocumentResources(null, document.meta);
    documentCollection.links = document.links;
    documentCollection.jsonapi = document.jsonapi;

    if (document.included) {
      documentCollection.included = document.included.map(resource => {
        const includedData = this.create(resource.id, resource.type);
        includedData.attributes = resource.attributes;
        if (resource.relationships) {
          includedData.relationships = resource.relationships;
        }
        includedData.links = resource.links;
        includedData.meta = resource.meta;
        return includedData;
      });
      documentCollection.included.map(resource => this.populate(resource, documentCollection));
    }

    documentCollection.data = document.data.map(resource => {
      const data = this.create(resource.id, resource.type);
      data.attributes = resource.attributes;
      data.links = resource.links;
      data.meta = resource.meta;
      if (resource.relationships) {
        data.relationships = resource.relationships;
        this.populate(data, documentCollection);
      }
      return data;
    });
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

  updateRelationships(name: string, params?: Parameters): Observable<DocumentResources> {
    const relationship = this.relationships[name] as DocumentResources;
    const identifiers = relationship.data.map(resource => new Identifier(resource.id, resource.type));
    return JsonApi.http.patch<DocumentResources>(`${this.url}/${this.id}/relationships/${name}`, identifiers, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => Resource.createDocumentResources(document)),
      tap(document => this.relationships[name] = document)
    );
  }

  saveRelationships(
    name: string,
    relationships: Identifier[],
    params?: Parameters
  ): Observable<DocumentResources> {
    return JsonApi.http.post<DocumentResources>(`${this.url}/${this.id}/relationships/${name}`, {
      data: relationships
    }, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => Resource.createDocumentResources(document)),
      tap(document => {
        const savedRelationshipsIds = document.data.map(relationship => relationship.id);
        const collection = this.relationships[name] as DocumentResources;
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
        const collection = this.relationships[name] as DocumentResources;
        this.relationships[name].data = collection.data
          .filter(relationship => !deletedRelationshipsIds.includes(relationship.id));
      })
    );
  }
}
