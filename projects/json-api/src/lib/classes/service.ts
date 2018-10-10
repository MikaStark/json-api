import { Resource } from './resource';
import { DocumentResources } from './document-resources';
import { DocumentResource } from './document-resource';
import { Parameters } from '../interfaces/parameters';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
      map(document => new DocumentResources<R>(document))
    );
  }

  find(id: string, params?: Parameters): Observable<DocumentResource<R>> {
    return JsonApiModule.http.get<JsonDocumentResource>(`${this.url}/${id}`, {
      params: JsonApiModule.params.httpParams(params)
    }).pipe(
      map(document => new DocumentResource<R>(document))
    );
  }
}

