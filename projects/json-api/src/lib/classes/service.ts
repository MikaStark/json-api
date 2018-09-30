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

  private generateResource(data: Resource): R {
    const resource = this.create();
    resource.id = data.id;
    resource.attributes = data.attributes;
    resource.relationships = data.relationships;
    return resource;
  }

  private generateDocumentCollection(document: Document): DocumentCollection<R> {
    const documentCollection = new DocumentCollection<R>();
    const resources = document.data as Resource[];
    documentCollection.data = resources.map(resource => this.generateResource(resource));
    documentCollection.errors = document.errors;
    documentCollection.meta = document.meta;
    documentCollection.jsonapi = document.jsonapi;
    documentCollection.links = document.links;
    documentCollection.included = document.included;
    return documentCollection;
  }

  private generateDocumentResource(document: Document): DocumentResource<R> {
    const documentResource = new DocumentResource<R>();
    const resource = document.data as Resource;
    documentResource.data = this.generateResource(resource);
    documentResource.errors = document.errors;
    documentResource.meta = document.meta;
    documentResource.jsonapi = document.jsonapi;
    documentResource.links = document.links;
    documentResource.included = document.included;
    return documentResource;
  }

  create(): R {
    const resource = new this.resource();
    resource.type = this.type;
    return resource as R;
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

