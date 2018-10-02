import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { DocumentCollection } from '../classes/document-collection';
import { DocumentResource } from '../classes/document-resource';
import { Resource } from '../classes/resource';
import { JsonApiService as JsonApi } from '../json-api.service';
import { Parameters, Relationships } from '../interfaces';
import { Errors } from '../interfaces/errors';
import { RelationshipsDeclaration } from '../interfaces/relationships-declaration';

export class Service<R extends Resource = Resource> {
  type: string;
  resource: typeof Resource = Resource;
  relationships: RelationshipsDeclaration = {};

  private get url(): string {
    return `${JsonApi.url}/${this.type}`;
  }

  private createRelationship(name: string): Resource {
    if (this.relationships[name]) {
      return new this.relationships[name]();
    }
    return new Resource();
  }

  private generateRelationships(relationships: Relationships): Relationships {
    for (const name in relationships) {
      if (Array.isArray(relationships[name].data)) {
        const collection = relationships[name] as DocumentCollection;
        relationships[name] = new DocumentCollection(
          collection.data.map(relationship => {
            const resource = this.createRelationship(name);
            resource.id = relationship.id;
            resource.type = relationship.type;
            resource.attributes = relationship.attributes;
            resource.relationships = this.generateRelationships(relationship.relationships);
            resource.links = relationship.links;
            return resource;
          }),
          collection.included,
          collection.meta,
          collection.links,
          collection.jsonapi
        );
      } else {
        const relationship = relationships[name] as DocumentResource;
        const resource = this.createRelationship(name);
        resource.id = relationship.data.id;
        resource.type = relationship.data.type;
        resource.attributes = relationship.data.attributes;
        resource.relationships = this.generateRelationships(relationship.data.relationships);
        resource.links = relationship.data.links;
        relationships[name] = new DocumentResource(
          resource,
          relationship.included,
          relationship.meta,
          relationship.links,
          relationship.jsonapi
        );
      }
    }
    return relationships;
  }

  private generateIncluded(included: Resource[]): Resource[] {
    if (!included) {
      return [];
    }
    return included.map(resource => new Resource(
      resource.id,
      resource.type,
      resource.attributes,
      this.generateRelationships(resource.relationships),
      resource.links,
    ));
  }

  private generateResource(data: Resource): R {
    const resource = this.create();
    resource.id = data.id;
    resource.attributes = data.attributes;
    resource.relationships = this.generateRelationships(data.relationships),
      resource.links = data.links;
    return resource;
  }

  create(): R {
    return new this.resource(null, this.type) as R;
  }

  all(params?: Parameters): Observable<DocumentCollection<R>> {
    return JsonApi.http.get<DocumentCollection>(this.url, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(err as Errors)),
      map(document => new DocumentCollection<R>(
        document.data.map(resource => this.generateResource(resource)),
        this.generateIncluded(document.included),
        document.meta,
        document.links,
        document.jsonapi
      )),
      tap(document => JsonApi.populateDocumentCollection(document))
    );
  }

  find(id: string, params?: Parameters): Observable<DocumentResource<R>> {
    return JsonApi.http.get<DocumentResource>(`${this.url}/${id}`, {
      params: JsonApi.params.httpParams(params)
    }).pipe(
      catchError(err => throwError(err as Errors)),
      map(document => new DocumentResource<R>(
        this.generateResource(document.data),
        this.generateIncluded(document.included),
        document.meta,
        document.links,
        document.jsonapi
      )),
      tap(document => JsonApi.populateDocumentResource(document))
    );
  }
}

