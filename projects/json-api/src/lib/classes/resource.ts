import { HttpClient } from '@angular/common/http';
import { DocumentResource } from './document-resource';
import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DocumentCollection } from './document-collection';
import { JsonApiParametersService } from '../json-api-parameters.service';
import { Attributes } from '../interfaces/attributes';
import { Relationships } from '../interfaces/relationships';
import { JsonApiService } from '../json-api.service';
import { Parameters } from '../interfaces/parameters';

export class Resource {
  id: string;
  type: string;
  attributes: Attributes = {};
  relationships: Relationships = {};
  links: any = { };

  private _deleted = false;

  get deleted(): boolean {
    return this._deleted;
  }

  private get http(): HttpClient {
    return JsonApiService.http;
  }

  private get url(): string {
    return `${JsonApiService.url}/${this.type}`;
  }

  private get params(): JsonApiParametersService {
    return JsonApiService.params;
  }

  private populateDocumentResource(document: DocumentResource): void {
    return JsonApiService.populateDocumentResource(document);
  }

  private populateDocumentCollection(document: DocumentCollection): void {
    return JsonApiService.populateDocumentCollection(document);
  }

  getRelationship<T extends Resource = Resource>(name: string, params?: Parameters): Observable<DocumentResource<T>> {
    if (!this.id) {
      return throwError('This resource has no id so it cannot get relationship');
    }
    return this.http.get<DocumentResource<T>>(`${this.url}/${this.id}/relationships/${name}`, {
      params: this.params.httpParams(params)
    }).pipe(
      tap(document => this.populateDocumentResource(document))
    );
  }

  getRelationships<T extends Resource = Resource>(name: string, params?: Parameters): Observable<DocumentCollection<T>> {
    if (!this.id) {
      return throwError('This resource has no id so it cannot get relationships');
    }
    return this.http.get<DocumentCollection<T>>(`${this.url}/${this.id}/relationships/${name}`, {
      params: this.params.httpParams(params)
    }).pipe(
      tap(document => this.populateDocumentCollection(document))
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
    return this.http.post<DocumentResource>(this.url, body, {
      params: this.params.httpParams(params)
    }).pipe(
      tap(document => this.populateDocumentResource(document)),
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
    return this.http.patch<DocumentResource>(this.url, body, {
      params: this.params.httpParams(params)
    }).pipe(
      tap(document => this.populateDocumentResource(document)),
      tap(document => {
        this.id = document.data.id;
        this.attributes = document.data.attributes;
      })
    );
  }

  updateRelationship<T extends Resource = Resource>(name: string, params?: Parameters): Observable<DocumentResource<T>> {
    if (!this.id) {
      return throwError('This resource has no id so it cannot update a relationship');
    }
    return this.http.patch<DocumentResource<T>>(`${this.url}/${this.id}/relationships/${name}`, this.relationships[name], {
      params: this.params.httpParams(params)
    }).pipe(
      tap(document => this.populateDocumentResource(document)),
      tap(document => this.relationships[name] = document)
    );
  }

  updateRelationships<T extends Resource = Resource>(name: string, params?: Parameters): Observable<DocumentCollection<T>> {
    if (!this.id) {
      throw new Error('This resource has no id so it cannot update relationships');
    }
    return this.http.patch<DocumentCollection<T>>(`${this.url}/${this.id}/relationships/${name}`, this.relationships[name], {
      params: this.params.httpParams(params)
    }).pipe(
      tap(document => this.populateDocumentCollection(document)),
      tap(document => this.relationships[name] = document)
    );
  }

  saveRelationships<T extends Resource = Resource>(
    name: string,
    relationships: Resource[],
    params?: Parameters
  ): Observable<DocumentCollection<T>> {
    if (!this.id) {
      return throwError('This resource has no id so it cannot save relationships');
    }
    const body = {
      data: relationships.map(relationship => ({
        id: relationship.id,
        type: relationship.type
      }))
    };
    return this.http.post<DocumentCollection<T>>(`${this.url}/${this.id}/relationships/${name}`, body, {
      params: this.params.httpParams(params)
    }).pipe(
      tap(document => this.populateDocumentCollection(document)),
      tap(document => {
        const savedRelationshipsIds = document.data.map(relationship => relationship.id);
        this.relationships[name].data = (this.relationships[name].data as T[])
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
    return this.http.request<void>('delete', `${this.url}/${this.id}/relationships/${name}`, {
      body
    }).pipe(
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
    return this.http.delete<void>(`${this.url}/${this.id}`).pipe(
      tap(() => this._deleted = true)
    );
  }
}
