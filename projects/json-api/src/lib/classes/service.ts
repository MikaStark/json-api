import { Resource } from './resource';
import { DocumentResources } from './document-resources';
import { DocumentResource } from './document-resource';
import { Parameters } from '../interfaces/parameters';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DocumentError } from './document-error';
import { JsonApiParametersService } from '../json-api-parameters.service';
import { HttpClient } from '@angular/common/http';
import { JsonApiFactoryService } from '../json-api-factory.service';
import { JsonDocumentResources } from '../interfaces/json-document-resources';
import { JsonDocumentResource } from '../interfaces/json-document-resource';

export class Service<R extends Resource = Resource> {
  type: string;
  resource = Resource;

  get url(): string {
    return `${this.apiUrl}/${this.type}`;
  }

  constructor(
    private apiUrl: string,
    private http: HttpClient,
    private params: JsonApiParametersService,
    private factory: JsonApiFactoryService
  ) { }

  create(): R {
    return new this.resource(null, this.type, this.apiUrl, this.http, this.params, this.factory) as R;
  }

  all(params?: Parameters): Observable<DocumentResources<R>> {
    return this.http.get<JsonDocumentResources>(this.url, {
      params: this.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => this.factory.documentWithManyResources(document) as DocumentResources<R>)
    );
  }

  find(id: string, params?: Parameters): Observable<DocumentResource<R>> {
    return this.http.get<JsonDocumentResource>(`${this.url}/${id}`, {
      params: this.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(new DocumentError(err.errors, err.meta))),
      map(document => this.factory.documentWithOneResource(document) as DocumentResource<R>)
    );
  }
}

