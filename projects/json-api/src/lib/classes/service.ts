import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DocumentCollection } from '../classes/document-collection';
import { DocumentResource } from '../classes/document-resource';
import { Document } from '../classes/document';
import { HttpClient } from '@angular/common/http';
import { Resource } from '../classes/resource';
import { JsonApiService } from '../json-api.service';
import { Parameters } from '../interfaces';
import { JsonApiParametersService } from '../json-api-parameters.service';

export class Service<R extends Resource = Resource> {
  type: string;
  resource = Resource;

  private get http(): HttpClient {
    return JsonApiService.http;
  }

  private get params(): JsonApiParametersService {
    return JsonApiService.params;
  }

  private get url(): string {
    return `${JsonApiService.url}/${this.type}`;
  }

  private generateResource(resource: Resource): R {
    return new this.resource(
      resource.id,
      this.type,
      resource.attributes,
      resource.relationships,
      resource.links
    ) as R;
  }

  private generateDocumentCollection(document: Document): DocumentCollection<R> {
    const resources = document.data as Resource[];
    return new DocumentCollection<R>(
      resources.map(resource => this.generateResource(resource)),
      document.included,
      document.meta,
      document.links,
      document.jsonapi
    );
  }

  private generateDocumentResource(document: Document): DocumentResource<R> {
    const resource = document.data as Resource;
    return new DocumentResource<R>(
      this.generateResource(resource),
      document.included,
      document.meta,
      document.links,
      document.jsonapi
    );
  }

  create(): R {
    return new this.resource(null, this.type) as R;
  }

  all(params?: Parameters): Observable<DocumentCollection<R>> {
    return this.http.get<Document>(this.url, {
      params: this.params.httpParams(params)
    }).pipe(
      map(document => this.generateDocumentCollection(document)),
      tap(document => JsonApiService.populateDocumentCollection(document))
    );
  }

  find(id: string, params?: Parameters): Observable<DocumentResource<R>> {
    return this.http.get<Document>(`${this.url}/${id}`, {
      params: this.params.httpParams(params)
    }).pipe(
      map(document => this.generateDocumentResource(document)),
      tap(document => JsonApiService.populateDocumentResource(document))
    );
  }
}

