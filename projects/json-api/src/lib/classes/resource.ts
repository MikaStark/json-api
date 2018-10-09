import { Observable, throwError } from 'rxjs';
import { DocumentResource } from '../classes/document-resource';
import { DocumentResources } from './document-resources';
import { catchError, tap, map, filter } from 'rxjs/operators';
import { Attributes } from '../interfaces/attributes';
import { Links } from '../interfaces/links';
import { Parameters } from '../interfaces/parameters';
import { Identifier } from './identifier';
import { Meta } from '../interfaces/meta';
import { DocumentError } from './document-error';
import { DocumentIdentifier } from './document-identifier';
import { DocumentIdentifiers } from './document-identifiers';
import { Relationships } from '../interfaces/relationships';
import { Relationship } from '../interfaces/relationship';
import { JsonDocumentResource } from '../interfaces/json-document-resource';
import { JsonDocumentIdentifier } from '../interfaces/json-document-identifier';
import { JsonDocumentIdentifiers } from '../interfaces/json-document-identifiers';
import { JsonDocumentResources } from '../interfaces/json-document-resources';
import { JsonResource, JsonIdentifier } from '../interfaces';
import { JsonApiModule } from '../json-api.module';
import { JsonRelationshipsIdentifiers } from '../interfaces/json-relationships-identifiers';

export class Resource extends Identifier implements JsonResource {

  private _deleted = false;

  attributes: Attributes = {};
  relationships: { [name: string]: Relationships | Relationship } = {};
  meta: Meta = {};
  links: Links = {};

  get deleted(): boolean {
    return this._deleted;
  }

  get relationshipsIdentifiers(): JsonRelationshipsIdentifiers {
    const relationshipsIdentifiers: JsonRelationshipsIdentifiers = {};
    for (const name in this.relationships) {
      if (Array.isArray(this.relationships[name].data)) {
        const relationships = this.relationships[name].data as Resource[];
        relationshipsIdentifiers[name] = {
          data: relationships.map(relationship => ({
            type: relationship.type,
            id: relationship.id,
          }))
        };
      } else {
        const relationship = this.relationships[name].data as Resource;
        relationshipsIdentifiers[name] = {
          data: relationship ? {
            type: relationship.type,
            id: relationship.id
          } : null
        };
      }
    }
    return relationshipsIdentifiers;
  }

  save(params?: Parameters): Observable<DocumentResource> {
    const body: any = {
      data: {
        type: this.type,
        attributes: this.attributes,
        relationships: this.relationshipsIdentifiers
      }
    };
    if (this.id) {
      body.data.id = this.id;
    }
    return JsonApiModule.http.post<JsonDocumentResource>(this.url, body, {
      params: JsonApiModule.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => JsonApiModule.factory.documentWithOneResource(document)),
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
        attributes: this.attributes,
        relationships: this.relationshipsIdentifiers
      }
    };
    return JsonApiModule.http.patch<JsonDocumentResource>(`${this.url}/${this.id}`, body, {
      params: JsonApiModule.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => JsonApiModule.factory.documentWithOneResource(document)),
      tap(document => {
        this.id = document.data.id;
        this.attributes = document.data.attributes;
      })
    );
  }

  delete(): Observable<void> {
    return JsonApiModule.http.delete<void>(`${this.url}/${this.id}`).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      tap(() => this._deleted = true)
    );
  }

  getRelationship(name: string): Observable<DocumentIdentifier> {
    return JsonApiModule.http.get<JsonDocumentIdentifier>(`${this.url}/${this.id}/relationships/${name}`).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => JsonApiModule.factory.documentWithOneIdentifier(document))
    );
  }

  getRelationships(name: string): Observable<DocumentIdentifiers> {
    return JsonApiModule.http.get<JsonDocumentIdentifiers>(`${this.url}/${this.id}/relationships/${name}`).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => JsonApiModule.factory.documentWithManyIdentifiers(document))
    );
  }

  updateRelationship(name: string, identifier: JsonIdentifier): Observable<DocumentResource> {
    return JsonApiModule.http.patch<JsonDocumentResource>(`${this.url}/${this.id}/relationships/${name}`, {
      data: {
        id: identifier.id,
        type: identifier.type
      }
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => JsonApiModule.factory.documentWithOneResource(document)),
      tap(document => this.relationships[name] = {
        data: document.data,
        links: document.links
      })
    );
  }

  updateRelationships(name: string, identifiers: JsonIdentifier[]): Observable<DocumentResources> {
    return JsonApiModule.http.patch<JsonDocumentResources>(`${this.url}/${this.id}/relationships/${name}`, {
      data: identifiers.map(identifier => ({
        id: identifier.id,
        type: identifier.type
      }))
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => JsonApiModule.factory.documentWithManyResources(document)),
      tap(document => this.relationships[name] = {
        data: document.data,
        links: document.links
      })
    );
  }

  saveRelationships(
    name: string,
    relationships: JsonIdentifier[],
    params?: Parameters
  ): Observable<DocumentResources> {
    return JsonApiModule.http.post<JsonDocumentResources>(`${this.url}/${this.id}/relationships/${name}`, {
      data: relationships
    }, {
        params: JsonApiModule.params.httpParams(params)
      }).pipe(
        catchError(err => throwError(new DocumentError(err.errors, err.meta))),
        map(document => JsonApiModule.factory.documentWithManyResources(document)),
        tap(document => {
          if (!this.relationships[name]) {
            this.relationships[name] = {
              data: document.data,
              links: document.links
            };
          } else {
            const relationshipsData = this.relationships[name].data as Resource[];
            this.relationships[name].data = relationshipsData
              .filter(resource => !document.data.map(data => data.id).includes(resource.id))
              .concat(document.data);
          }
        })
      );
  }

  deleteRelationships(name: string, relationships: JsonIdentifier[]): Observable<void> {
    const body = {
      data: relationships
    };
    return JsonApiModule.http.request<void>('delete', `${this.url}/${this.id}/relationships/${name}`, { body }).pipe(
      filter(() => !!this.relationships[name]),
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
