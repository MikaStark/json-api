import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { DocumentCollection } from '../classes/document-collection';
import { DocumentResource } from '../classes/document-resource';
import { Document } from '../classes/document';
import { Resource } from '../classes/resource';
import { JsonApiService as JsonApi } from '../json-api.service';
import { Parameters, Relationships } from '../interfaces';
import { Errors } from '../interfaces/errors';

export class Service<R extends Resource = Resource> {
  type: string;
  resource = Resource;

  private get url(): string {
    return `${JsonApi.url}/${this.type}`;
  }

  private generateRelationships(relationships: Relationships): Relationships {
    for (const name in relationships) {
      if (relationships[name]) {
        const relationship = relationships[name];
        if (Array.isArray(relationship.data)) {
          relationships[name] = new DocumentCollection(
            relationship.data.map(resource => new Resource(
              resource.id,
              resource.type,
              resource.attributes,
              resource.relationships,
              resource.links,
            )),
            relationship.included,
            relationship.meta,
            relationship.links,
            relationship.jsonapi
          );
        } else {
          relationships[name] = new DocumentResource(
            new Resource(
              relationship.data.id,
              relationship.data.type,
              relationship.data.attributes,
              relationship.data.relationships,
              relationship.data.links,
            ),
            relationship.included,
            relationship.meta,
            relationship.links,
            relationship.jsonapi
          );
        }
      }
    }
    return relationships;
  }

  private generateResource(data: Resource): R {
    const resource = this.create();
    resource.id = data.id;
    resource.attributes = data.attributes;
    resource.relationships = this.generateRelationships(data.relationships),
      resource.links = data.links;
    return resource;
  }

  private generateDocumentCollection(document: Document): DocumentCollection<R> {
    const resources = document.data as Resource[];
    const included = document.included || [];
    return new DocumentCollection<R>(
      resources.map(resource => this.generateResource(resource)),
      included.map(resource => new Resource(
        resource.id,
        resource.type,
        resource.attributes,
        this.generateRelationships(resource.relationships),
        resource.links,
      )),
      document.meta,
      document.links,
      document.jsonapi
    );
  }

  private generateDocumentResource(document: Document): DocumentResource<R> {
    const included = document.included || [];
    const documentResource = new DocumentResource<R>(
      this.generateResource(document.data as Resource),
      included.map(resource => new Resource(
        resource.id,
        resource.type,
        resource.attributes,
        this.generateRelationships(resource.relationships),
        resource.links,
      )),
      document.meta,
      document.links,
      document.jsonapi
    );
    return documentResource;
  }

  create(): R {
    return new this.resource(null, this.type) as R;
  }

  all(params?: Parameters): Observable<DocumentCollection<R>> {
    return JsonApi.http.get<Document>(this.url, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(err as Errors)),
      map(document => this.generateDocumentCollection(document)),
      tap(document => JsonApi.populateIncluded(document)),
      tap(document => JsonApi.populateDocumentCollection(document))
    );
  }

  find(id: string, params?: Parameters): Observable<DocumentResource<R>> {
    return JsonApi.http.get<Document>(`${this.url}/${id}`, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(err as Errors)),
      map(document => this.generateDocumentResource(document)),
      tap(document => JsonApi.populateIncluded(document)),
      tap(document => JsonApi.populateDocumentResource(document))
    );
  }
}

