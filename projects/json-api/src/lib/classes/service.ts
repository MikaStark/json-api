import { Resource } from './resource';
import { DocumentResources } from './document-resources';
import { DocumentResource } from './document-resource';
import { Parameters } from '../interfaces/parameters';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { JsonDocumentResources } from '../interfaces/json-document-resources';
import { JsonDocumentResource } from '../interfaces/json-document-resource';
import { JsonApiModule } from '../json-api.module';
import { DocumentErrors } from './document-errors';

export class Service<R extends Resource = Resource> {
  get url(): string {
    return `${JsonApiModule.url}/${this.type}`;
  }

  constructor(
    public readonly type: string,
    public readonly resource = Resource
  ) {}

  create(): R {
    return new this.resource(null, this.type) as R;
  }

  all(params?: Parameters): Observable<DocumentResources<R>> {
    return JsonApiModule.http.get<JsonDocumentResources>(this.url, {
      params: JsonApiModule.params.httpParams(params)
    }).pipe(
      catchError(res => throwError(new DocumentErrors(res.error))),
      map(document => new DocumentResources<R>(document))
    );
  }

  find(id: string, params?: Parameters): Observable<DocumentResource<R>> {
    return JsonApiModule.http.get<JsonDocumentResource>(`${this.url}/${id}`, {
      params: JsonApiModule.params.httpParams(params)
    }).pipe(
      catchError(res => throwError(new DocumentErrors(res.error))),
      map(document => new DocumentResource<R>(document))
    );
  }
}

