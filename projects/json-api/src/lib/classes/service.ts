import { Resource } from './resource';
import { DocumentCollection } from './document-collection';
import { DocumentResource } from './document-resource';
import { JsonApiService as JsonApi } from '../json-api.service';
import { Parameters } from '../interfaces/parameters';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DocumentError } from './document-error';

export class Service<R extends Resource = Resource> {
  private get url(): string {
    return `${JsonApi.url}/${this.type}`;
  }

  constructor(
    public type: string,
    public resource: typeof Resource = Resource
  ) {
    Resource.register(type, resource);
  }

  create(): R {
    return new this.resource(null, this.type) as R;
  }

  all(params?: Parameters): Observable<DocumentCollection<R>> {
    return JsonApi.http.get<DocumentCollection<R>>(this.url, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => Resource.createDocumentCollection(document) as DocumentCollection<R>)
    );
  }

  find(id: string, params?: Parameters): Observable<DocumentResource<R>> {
    return JsonApi.http.get<DocumentResource<R>>(`${this.url}/${id}`, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => Resource.createDocumentResource(document) as DocumentResource<R>)
    );
  }
}

