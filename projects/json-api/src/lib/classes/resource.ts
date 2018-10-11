import { Observable } from 'rxjs';
import { DocumentResource } from '../classes/document-resource';
import { tap, map, filter } from 'rxjs/operators';
import { Attributes } from '../interfaces/attributes';
import { Links } from '../interfaces/links';
import { Parameters } from '../interfaces/parameters';
import { Identifier } from './identifier';
import { Meta } from '../interfaces/meta';
import { DocumentIdentifier } from './document-identifier';
import { DocumentIdentifiers } from './document-identifiers';
import { Relationships } from '../interfaces/relationships';
import { Relationship } from '../interfaces/relationship';
import { JsonDocumentResource } from '../interfaces/json-document-resource';
import { JsonDocumentIdentifier } from '../interfaces/json-document-identifier';
import { JsonDocumentIdentifiers } from '../interfaces/json-document-identifiers';
import { JsonResource, JsonIdentifier } from '../interfaces';
import { JsonApiModule } from '../json-api.module';
import { JsonRelationshipsIdentifiers } from '../interfaces/json-relationships-identifiers';

export class Resource extends Identifier implements JsonResource {
  private _deleted = false;

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

  constructor(
    id: string,
    type: string,
    meta: Meta = {},
    public attributes: Attributes = {},
    public relationships: { [name: string]: Relationships | Relationship } = {},
    public links: Links = {}
  ) {
    super(id, type, meta);
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
      map(document => new DocumentResource(document)),
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
      map(document => new DocumentResource(document)),
      tap(document => {
        this.id = document.data.id;
        this.attributes = document.data.attributes;
      })
    );
  }

  delete(): Observable<void> {
    return JsonApiModule.http.delete<void>(`${this.url}/${this.id}`).pipe(
      tap(() => this._deleted = true)
    );
  }

  getRelationship(name: string): Observable<DocumentIdentifier> {
    return JsonApiModule.http.get<JsonDocumentIdentifier>(`${this.url}/${this.id}/relationships/${name}`).pipe(
      map(document => new DocumentIdentifier(document))
    );
  }

  getRelationships(name: string): Observable<DocumentIdentifiers> {
    return JsonApiModule.http.get<JsonDocumentIdentifiers>(`${this.url}/${this.id}/relationships/${name}`).pipe(
      map(document => new DocumentIdentifiers(document))
    );
  }

  updateRelationship(name: string, relationship: Resource): Observable<DocumentIdentifier> {
    const body = {
      data: null
    };
    if (relationship) {
      body.data = {
        id: relationship.id,
        type: relationship.type
      };
    }
    return JsonApiModule.http.patch<JsonDocumentIdentifier>(`${this.url}/${this.id}/relationships/${name}`, body).pipe(
      map(document => new DocumentIdentifier(document)),
      tap(document => this.relationships[name] = {
        data: relationship,
        links: document.links
      })
    );
  }

  updateRelationships(name: string, relationships: Resource[]): Observable<DocumentIdentifiers> {
    return JsonApiModule.http.patch<JsonDocumentIdentifiers>(`${this.url}/${this.id}/relationships/${name}`, {
      data: relationships.map(relationship => ({
        id: relationship.id,
        type: relationship.type
      }))
    }).pipe(
      map(document => new DocumentIdentifiers(document)),
      tap(document => this.relationships[name] = {
        data: relationships,
        links: document.links
      })
    );
  }

  saveRelationships(name: string, relationships: Resource[]): Observable<DocumentIdentifiers> {
    return JsonApiModule.http.post<JsonDocumentIdentifiers>(`${this.url}/${this.id}/relationships/${name}`, {
      data: relationships.map(relationship => ({
        id: relationship.id,
        type: relationship.type
      }))
    }).pipe(
      map(document => new DocumentIdentifiers(document)),
      tap(document => {
        const oldRelationships = this.relationships[name].data as Resource[];
        this.relationships[name] = {
          data: oldRelationships
            .filter(resource => oldRelationships.map(data => data.id).includes(resource.id))
            .concat(relationships),
          links: document.links
        };
      })
    );
  }

  deleteRelationships(name: string, relationships: JsonIdentifier[]): Observable<void> {
    const body = {
      data: relationships
    };
    return JsonApiModule.http.request<void>('delete', `${this.url}/${this.id}/relationships/${name}`, { body }).pipe(
      filter(() => !!this.relationships[name]),
      tap(() => {
        const deletedRelationshipsIds = body.data.map(relationship => relationship.id);
        const collection = this.relationships[name] as Relationships;
        this.relationships[name].data = collection.data
          .filter(relationship => !deletedRelationshipsIds.includes(relationship.id));
      })
    );
  }
}
