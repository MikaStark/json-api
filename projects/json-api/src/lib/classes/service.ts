import { Resource } from './resource';
import { DocumentResources } from './document-resources';
import { DocumentResource } from './document-resource';
import { Parameters } from '../interfaces/parameters';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DocumentError } from './document-error';
import { JsonDocumentResources } from '../interfaces/json-document-resources';
import { JsonDocumentResource } from '../interfaces/json-document-resource';
import { JsonApiService } from '../json-api.service';

export class Service<R extends Resource = Resource> {
  type: string;
  resource = Resource;

  get url(): string {
    return `${JsonApiService.url}/${this.type}`;
  }

  create(): R {
    return new this.resource(null, this.type) as R;
  }

  all(params?: Parameters): Observable<DocumentResources<R>> {
    return JsonApiService.http.get<JsonDocumentResources>(this.url, {
      params: JsonApiService.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => JsonApiService.factory.documentWithManyResources(document) as DocumentResources<R>)
    );
  }

  find(id: string, params?: Parameters): Observable<DocumentResource<R>> {
    return JsonApiService.http.get<JsonDocumentResource>(`${this.url}/${id}`, {
      params: JsonApiService.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => JsonApiService.factory.documentWithOneResource(document) as DocumentResource<R>)
    );
  }
}

