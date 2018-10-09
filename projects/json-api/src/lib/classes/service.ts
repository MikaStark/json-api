import { Resource } from './resource';
import { DocumentResources } from './document-resources';
import { DocumentResource } from './document-resource';
import { Parameters } from '../interfaces/parameters';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DocumentError } from './document-error';
import { JsonDocumentResources } from '../interfaces/json-document-resources';
import { JsonDocumentResource } from '../interfaces/json-document-resource';
import { JsonApiModule } from '../json-api.module';

export class Service<R extends Resource = Resource> {
  type: string;
  resource = Resource;

  get url(): string {
    return `${JsonApiModule.url}/${this.type}`;
  }

  create(): R {
    return new this.resource(null, this.type) as R;
  }

  all(params?: Parameters): Observable<DocumentResources<R>> {
    return JsonApiModule.http.get<JsonDocumentResources>(this.url, {
      params: JsonApiModule.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => JsonApiModule.factory.documentWithManyResources(document) as DocumentResources<R>)
    );
  }

  find(id: string, params?: Parameters): Observable<DocumentResource<R>> {
    return JsonApiModule.http.get<JsonDocumentResource>(`${this.url}/${id}`, {
      params: JsonApiModule.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => JsonApiModule.factory.documentWithOneResource(document) as DocumentResource<R>)
    );
  }
}

