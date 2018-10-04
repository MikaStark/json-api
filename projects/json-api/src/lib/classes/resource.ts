import { Observable, throwError } from 'rxjs';
import { DocumentResource } from '../classes/document-resource';
import { DocumentResources } from './document-resources';
import { catchError, tap, map } from 'rxjs/operators';
import { JsonApiModule as JsonApi } from '../json-api.module';
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

export class Resource extends Identifier {

  private _deleted = false;

  public attributes: Attributes;
  public relationships: {[name: string]: Relationships|Relationship};
  public meta: Meta;
  public links: Links;

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
      map(document => JsonApi.builder.documentResource(document)),
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
      map(document => JsonApi.builder.documentResource(document)),
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
      map(document => JsonApi.builder.documentIdentifier(document))
    );
  }

  getRelationships(name: string): Observable<DocumentIdentifiers> {
    return JsonApi.http.get<DocumentIdentifiers>(`${this.url}/${this.id}/relationships/${name}`).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => JsonApi.builder.documentIdentifiers(document))
    );
  }

  updateRelationship(name: string, params?: Parameters): Observable<DocumentResource> {
    const relationship = this.relationships[name] as DocumentResource;
    const identifier = new Identifier(relationship.data.id, relationship.data.type);
    return JsonApi.http.patch<DocumentResource>(`${this.url}/${this.id}/relationships/${name}`, identifier, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => JsonApi.builder.documentResource(document)),
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
      map(document => JsonApi.builder.documentResources(document)),
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
      map(document => JsonApi.builder.documentResources(document)),
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
