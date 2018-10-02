import { DocumentResource } from './document-resource';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { DocumentCollection } from './document-collection';
import { Attributes } from '../interfaces/attributes';
import { Relationships } from '../interfaces/relationships';
import { JsonApiService as JsonApi } from '../json-api.service';
import { Parameters } from '../interfaces/parameters';
import { Errors } from '../interfaces/errors';
import { Links } from '../interfaces/links';

export class Resource {
  private _deleted = false;

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
      tap(document => JsonApi.populateDocumentResource(document))
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
      tap(document => JsonApi.populateDocumentCollection(document))
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
      tap(document => JsonApi.populateDocumentResource(document)),
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
      tap(document => JsonApi.populateDocumentResource(document)),
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
      tap(document => JsonApi.populateDocumentResource(document)),
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
      tap(document => JsonApi.populateDocumentCollection(document)),
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
      tap(document => JsonApi.populateDocumentCollection(document)),
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
