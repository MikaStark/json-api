import { Resource } from './resource';
import { DocumentCollection } from './document-collection';
import { DocumentResource } from './document-resource';
import { JsonApiService as JsonApi } from '../json-api.service';
import { Parameters } from '../interfaces/parameters';
import { Errors } from '../interfaces/errors';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export class Service<R extends Resource = Resource> {
  type: string;
  resource: typeof Resource = Resource;

  private get url(): string {
    return `${JsonApi.url}/${this.type}`;
  }

  create(): R {
    return new this.resource(null, this.type) as R;
  }

  all(params?: Parameters): Observable<DocumentCollection<R>> {
    return JsonApi.http.get<DocumentCollection<R>>(this.url, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(err as Errors)),
      map(document => JsonApi.builder.collection(document, this.resource) as DocumentCollection<R>)
    );
  }

  find(id: string, params?: Parameters): Observable<DocumentResource<R>> {
    return JsonApi.http.get<DocumentResource<R>>(`${this.url}/${id}`, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(err as Errors)),
      map(document => JsonApi.builder.resource(document, this.resource) as DocumentResource<R>)
    );
  }
}

