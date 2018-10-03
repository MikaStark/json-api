import { Observable, throwError } from 'rxjs';
import { DocumentResource } from '../classes/document-resource';
import { DocumentCollection } from '../classes/document-collection';
import { catchError, tap, map } from 'rxjs/operators';
import { JsonApiService as JsonApi } from '../json-api.service';
import { Attributes } from '../interfaces/attributes';
import { Relationships } from '../interfaces/relationships';
import { Links } from '../interfaces/links';
import { Parameters } from '../interfaces/parameters';
import { Errors } from '../interfaces/errors';
import { Document } from '../classes/document';
import { ResourceTypes } from '../interfaces/resource-types';

export class Resource {

  private static types: ResourceTypes = {};

  private _deleted = false;

  private static resourceType(type: string): typeof Resource {
    const resourceType = this.types[type];
    if (resourceType) {
      return resourceType;
    }
    return Resource;
  }

  private static findRelationship(resource: Resource, document: Document): Resource {
    const relationship = document.included
      .concat(document.data || [])
      .find(included => included.id === resource.id && included.type === resource.type);
    return relationship || resource;
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

  private static relationships(relationships: Relationships): Relationships {
    const newRelationships: Relationships = {};
    for (const name in relationships) {
      if (Array.isArray(relationships[name].data)) {
        const collection = relationships[name] as DocumentCollection;
        newRelationships[name] = new DocumentCollection(
          collection.data.map(relationship => new Resource(
            relationship.id,
            relationship.type,
            relationship.attributes,
            relationship.relationships,
            relationship.links
          )),
          collection.included,
          collection.meta,
          collection.links,
          collection.jsonapi
        );
      } else {
        const relationship = relationships[name] as DocumentResource;
        newRelationships[name] = new DocumentResource(
          new Resource(
            relationship.data.id,
            relationship.data.type,
            relationship.data.attributes,
            relationship.data.relationships,
            relationship.data.links
          ),
          relationship.included,
          relationship.meta,
          relationship.links,
          relationship.jsonapi
        );

      }
    }
    return newRelationships;
  }

  static documentResource(document: DocumentResource): DocumentResource {
    const included = document.included || [];
    const dataType = this.resourceType(document.data.type);
    const data = new dataType(
      document.data.id,
      document.data.type,
      document.data.attributes,
      this.relationships(document.data.relationships),
      document.data.links
    );
    const documentResource = new DocumentResource(
      data,
      included.map(resource => {
        const type = this.resourceType(resource.type);
        return new type(
          resource.id,
          resource.type,
          resource.attributes,
          this.relationships(resource.relationships),
          resource.links,
        );
      }),
      document.meta,
      document.links,
      document.jsonapi
    );
    documentResource.included.map(resource => this.populate(resource, documentResource));
    this.populate(documentResource.data, documentResource);
    return documentResource;
  }

  static documentCollection(document: DocumentCollection): DocumentCollection {
    const included = document.included || [];
    const documentCollection = new DocumentCollection(
      document.data.map(resource => {
        const type = this.resourceType(resource.type);
        return new type(
          resource.id,
          resource.type,
          resource.attributes,
          this.relationships(resource.relationships),
          resource.links,
        );
      }),
      included.map(resource => {
        const type = this.resourceType(resource.type);
        return new type(
          resource.id,
          resource.type,
          resource.attributes,
          this.relationships(resource.relationships),
          resource.links,
        );
      }),
      document.meta,
      document.links,
      document.jsonapi
    );
    documentCollection.included.map(resource => this.populate(resource, documentCollection));
    documentCollection.data.map(resource => this.populate(resource, documentCollection));
    return documentCollection;
  }

  static register(name: string, type: typeof Resource): void {
    Resource.types[name] = type;
  }

  get deleted(): boolean {
    return this._deleted;
  }

  private get url(): string {
    return `${JsonApi.url}/${this.type}`;
  }

  constructor(
    public id: string = '',
    public type: string = '',
    public attributes: Attributes = {},
    public relationships: Relationships = {},
    public links: Links = {}
  ) { }

  getRelationship(name: string, params?: Parameters): Observable<DocumentResource> {
    if (!this.id) {
      return throwError('This resource has no id so it cannot get relationship');
    }
    return JsonApi.http.get<DocumentResource>(`${this.url}/${this.id}/relationships/${name}`, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(err as Errors)),
      map(document => Resource.documentResource(document))
    );
  }

  getRelationships(name: string, params?: Parameters): Observable<DocumentCollection> {
    if (!this.id) {
      return throwError('This resource has no id so it cannot get relationships');
    }
    return JsonApi.http.get<DocumentCollection>(`${this.url}/${this.id}/relationships/${name}`, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(err as Errors)),
      map(document => Resource.documentCollection(document))
    );
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
      catchError(err => throwError(err as Errors)),
      map(document => Resource.documentResource(document)),
      tap(document => {
        this.id = document.data.id;
        this.attributes = document.data.attributes;
      })
    );
  }

  update(params?: Parameters): Observable<DocumentResource> {
    if (!this.id) {
      return throwError('This resource has no id so it cannot be updated');
    }
    const body: any = {
      data: {
        type: this.type,
        id: this.id,
        attributes: this.attributes
      }
    };
    return JsonApi.http.patch<DocumentResource>(`${this.url}/${this.id}`, body, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(err as Errors)),
      map(document => Resource.documentResource(document)),
      tap(document => {
        this.id = document.data.id;
        this.attributes = document.data.attributes;
      })
    );
  }

  updateRelationship(name: string, params?: Parameters): Observable<DocumentResource> {
    if (!this.id) {
      return throwError('This resource has no id so it cannot update a relationship');
    }
    return JsonApi.http.patch<DocumentResource>(`${this.url}/${this.id}/relationships/${name}`, this.relationships[name], {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(err as Errors)),
      map(document => Resource.documentResource(document)),
      tap(document => this.relationships[name] = document)
    );
  }

  updateRelationships(name: string, params?: Parameters): Observable<DocumentCollection> {
    if (!this.id) {
      throw new Error('This resource has no id so it cannot update relationships');
    }
    return JsonApi.http.patch<DocumentCollection>(`${this.url}/${this.id}/relationships/${name}`, this.relationships[name], {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(err as Errors)),
      map(document => Resource.documentCollection(document)),
      tap(document => this.relationships[name] = document)
    );
  }

  saveRelationships(
    name: string,
    relationships: Resource[],
    params?: Parameters
  ): Observable<DocumentCollection> {
    if (!this.id) {
      return throwError('This resource has no id so it cannot save relationships');
    }
    const body = {
      data: relationships.map(relationship => ({
        id: relationship.id,
        type: relationship.type
      }))
    };
    return JsonApi.http.post<DocumentCollection>(`${this.url}/${this.id}/relationships/${name}`, body, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(err as Errors)),
      map(document => Resource.documentCollection(document)),
      tap(document => {
        const savedRelationshipsIds = document.data.map(relationship => relationship.id);
        this.relationships[name].data = (this.relationships[name].data as Resource[])
          .filter(relationship => !savedRelationshipsIds.includes(relationship.id))
          .concat(document.data);
      })
    );
  }

  deleteRelationships(name: string, relationships: Resource[]): Observable<void> {
    if (!this.id) {
      return throwError('This resource has no id so it cannot update a relationship');
    }
    const body = {
      data: relationships.map(relationship => ({
        id: relationship.id,
        type: relationship.type
      }))
    };
    return JsonApi.http.request<void>('delete', `${this.url}/${this.id}/relationships/${name}`, {
      body
    }).pipe(
      catchError(err => throwError(err as Errors)),
      tap(() => {
        const deletedRelationshipsIds = body.data.map(relationship => relationship.id);
        this.relationships[name].data = (this.relationships[name].data as Resource[])
          .filter(relationship => !deletedRelationshipsIds.includes(relationship.id));
      })
    );
  }

  delete(): Observable<void> {
    if (!this.id) {
      return throwError('This resource has no id so it cannot be deleted');
    }
    return JsonApi.http.delete<void>(`${this.url}/${this.id}`).pipe(
      catchError(err => throwError(err as Errors)),
      tap(() => this._deleted = true)
    );
  }
}
