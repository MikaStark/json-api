import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import 'reflect-metadata';
import { iif, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { JsonApiIdentifier } from './classes/json-api-identifier';
import { JsonApiResource } from './classes/json-api-resource';
import { JsonApiAttributes } from './interfaces/json-api-attributes';
import { JsonApiDocument } from './interfaces/json-api-document';
import { JsonApiIdentifierInterface } from './interfaces/json-api-identifier-interface';
import { JsonApiParameters } from './interfaces/json-api-parameters';
import { JsonApiRelationships } from './interfaces/json-api-relationships';
import { JsonApiResourceInterface } from './interfaces/json-api-resource-interface';
import { JsonApiParametersService } from './json-api-parameters.service';
import { JSON_API_URL } from './json-api-url';

export type ResourceType<T extends JsonApiResource> = new (data: any) => T;

export interface ResourceDiff {
  name: string;
  current: any;
  new: any;
}

interface SaveData {
  type: string;
  id?: string;
  attributes?: JsonApiAttributes;
  relationships?: JsonApiRelationships;
}

interface UpdateData {
  type: string;
  id: string;
  attributes?: JsonApiAttributes;
  relationships?: JsonApiRelationships;
}

@Injectable({
  providedIn: 'root'
})
export class JsonApiService {
  constructor(
    protected http: HttpClient,
    protected parameters: JsonApiParametersService,
    @Inject(JSON_API_URL) protected url: string
  ) {}

  all<R extends JsonApiResource>(
    model: ResourceType<R>,
    params?: JsonApiParameters
  ): Observable<JsonApiDocument<R[]>> {
    return this.http
      .get<JsonApiDocument<R[]>>(`${this.url}/${model.prototype.type}`, {
        params: this.parameters.create(params)
      })
      .pipe(
        map(({ data, meta, links, jsonapi, included }: JsonApiDocument<JsonApiResource[]>) => {
          const document: JsonApiDocument<R[]> = {
            data: data.map(resource => new model(resource)),
            meta,
            links,
            jsonapi
          };
          if (included) {
            document.included = included.map(resource => this.create(resource));
            this.populate(document, data, included);
          }

          return document;
        })
      );
  }

  find<R extends JsonApiResource>(
    model: ResourceType<R>,
    id: string,
    params?: JsonApiParameters
  ): Observable<JsonApiDocument<R>> {
    return this.http
      .get<JsonApiDocument<R>>(`${this.url}/${model.prototype.type}/${id}`, {
        params: this.parameters.create(params)
      })
      .pipe(
        map(({ data, meta, links, jsonapi, included }: JsonApiDocument<JsonApiResource>) => {
          const document: JsonApiDocument<R> = {
            data: new model(data),
            meta,
            links,
            jsonapi
          };

          if (included) {
            document.included = included.map(resource => this.create(resource));
            this.populate(document, data, included);
          }

          return document;
        })
      );
  }

  save<R extends JsonApiResource = JsonApiResource>(resource: R): Observable<JsonApiDocument<R>> {
    if (!resource.type) {
      return throwError(new Error('You can not save a resource without type'));
    }

    const body: SaveData = { type: resource.type };
    if (!!resource.id) {
      body.id = resource.id;
    }
    if (!!resource.attributes) {
      body.attributes = resource.attributes;
    }
    if (!!resource.relationships) {
      body.relationships = this.extractRelationshipsIdentifiers(resource.relationships);
    }

    return this.http.post<JsonApiDocument<R>>(`${this.url}/${resource.type}`, { data: body }).pipe(
      map(({ data, meta, links, jsonapi }) => {
        resource.id = data.id;
        resource.links = data.links;
        resource.meta = data.meta;
        return {
          data: this.create<R>(data),
          meta,
          links,
          jsonapi
        };
      })
    );
  }

  update<R extends JsonApiResource = JsonApiResource>(resource: R): Observable<JsonApiDocument<R>> {
    if (!resource.type) {
      return throwError(new Error('You can not update a resource without type'));
    }
    if (!resource.id) {
      return throwError(new Error('You can not update a resource without id'));
    }

    const body: UpdateData = { type: resource.type, id: resource.id };
    if (!!resource.attributes) {
      body.attributes = resource.attributes;
    }
    if (!!resource.relationships) {
      body.relationships = this.extractRelationshipsIdentifiers(resource.relationships);
    }

    return this.http
      .patch<JsonApiDocument<R>>(`${this.url}/${resource.type}/${resource.id}`, { data: body })
      .pipe(
        map(({ data, meta, links, jsonapi }) => {
          resource.id = data.id;
          resource.links = data.links;
          resource.meta = data.meta;
          return {
            data: this.create<R>(data),
            meta,
            links,
            jsonapi
          };
        })
      );
  }

  delete(resource: JsonApiResource): Observable<void> {
    if (!resource.type) {
      return throwError(new Error('You can not delete a resource without type'));
    }
    if (!resource.id) {
      return throwError(new Error('You can not delete a resource without id'));
    }
    return this.http.delete<void>(`${this.url}/${resource.type}/${resource.id}`);
  }

  getRelationship(
    resource: JsonApiResource,
    name: string
  ): Observable<JsonApiDocument<JsonApiIdentifier>> {
    if (!resource.type) {
      return throwError(new Error('You can not get relationship a resource without type'));
    }
    if (!resource.id) {
      return throwError(new Error('You can not get relationship a resource without id'));
    }
    return this.http
      .get<JsonApiDocument<JsonApiIdentifierInterface>>(
        `${this.url}/${resource.type}/${resource.id}/relationships/${name}`
      )
      .pipe(
        map(({ data, meta, links, jsonapi }) => ({
          data: new JsonApiIdentifier(data),
          meta,
          links,
          jsonapi
        }))
      );
  }

  getRelationships(
    resource: JsonApiResource,
    name: string
  ): Observable<JsonApiDocument<JsonApiIdentifier[]>> {
    if (!resource.type) {
      return throwError(new Error('You can not get relationships of a resource without type'));
    }
    if (!resource.id) {
      return throwError(new Error('You can not get relationships of a resource without id'));
    }
    return this.http
      .get<JsonApiDocument<JsonApiIdentifierInterface[]>>(
        `${this.url}/${resource.type}/${resource.id}/relationships/${name}`
      )
      .pipe(
        map(({ data, meta, links, jsonapi }) => ({
          data: data.map(identifier => new JsonApiIdentifier(identifier)),
          meta,
          links,
          jsonapi
        }))
      );
  }

  updateRelationship(
    resource: JsonApiResource,
    name: string,
    relationship: JsonApiResource
  ): Observable<void> {
    if (!resource.type) {
      return throwError(new Error('You can not update relationship of a resource without type'));
    }
    if (!resource.id) {
      return throwError(new Error('You can not update relationship of a resource without id'));
    }
    return this.http
      .patch<void>(`${this.url}/${resource.type}/${resource.id}/relationships/${name}`, {
        data: {
          type: relationship.type,
          id: relationship.id
        }
      })
      .pipe(tap(() => (resource[name] = relationship)));
  }

  updateRelationships(
    resource: JsonApiResource,
    name: string,
    relationships: JsonApiResource[]
  ): Observable<void> {
    if (!resource.type) {
      return throwError(new Error('You can not update relationships of a resource without type'));
    }
    if (!resource.id) {
      return throwError(new Error('You can not update relationships of a resource without id'));
    }

    const body = {
      data: relationships.map(({ type, id }) => ({ type, id }))
    };

    return this.http
      .patch<void>(`${this.url}/${resource.type}/${resource.id}/relationships/${name}`, body)
      .pipe(tap(() => (resource[name] = relationships)));
  }

  saveRelationships(
    resource: JsonApiResource,
    name: string,
    relationships: JsonApiResource[]
  ): Observable<void> {
    if (!resource.type) {
      return throwError(new Error('You can not save relationships of a resource without type'));
    }
    if (!resource.id) {
      return throwError(new Error('You can not save relationships of a resource without id'));
    }

    const body = {
      data: relationships.map(({ type, id }) => ({ type, id }))
    };

    return this.http
      .post<void>(`${this.url}/${resource.type}/${resource.id}/relationships/${name}`, body)
      .pipe(
        tap(() => {
          const oldRelationships = resource[name] as JsonApiResource[];
          resource[name] = oldRelationships
            .filter(relationship => oldRelationships.map(data => data.id).includes(relationship.id))
            .concat(relationships);
        })
      );
  }

  deleteRelationships(
    resource: JsonApiResource,
    name: string,
    relationships: JsonApiResource[]
  ): Observable<void> {
    if (!resource.type) {
      return throwError(new Error('You can not delete relationships of a resource without type'));
    }
    if (!resource.id) {
      return throwError(new Error('You can not delete relationships of a resource without id'));
    }
    return this.http
      .request<void>(
        'delete',
        `${this.url}/${resource.type}/${resource.id}/relationships/${name}`,
        {
          body: {
            data: relationships.map(({ type, id }) => ({ type, id }))
          }
        }
      )
      .pipe(
        filter(() => !!resource[name]),
        tap(() => {
          if (resource[name]) {
            const deletedRelationshipsIds = relationships.map(({ id }) => id);
            resource[name] = (resource[name] as JsonApiResource[]).filter(
              relationship => !deletedRelationshipsIds.includes(relationship.id)
            );
          }
        })
      );
  }

  create<R extends JsonApiResource = JsonApiResource>(resource: JsonApiIdentifierInterface): R {
    const metadata = Reflect.getMetadata('models', JsonApiResource);
    const model = metadata[resource.type] as typeof JsonApiResource;
    if (!model) {
      throw new Error(`Unknown "${resource.type}" Resource`);
    }
    return new model(resource) as R;
  }

  private findResourceByIdentifier(
    { id, type }: JsonApiIdentifierInterface,
    resources: JsonApiResourceInterface[]
  ): JsonApiResourceInterface {
    return resources.find(resource => id === resource.id && type === resource.type);
  }

  protected populate(
    document: JsonApiDocument,
    data: JsonApiResource | JsonApiResource[],
    included: JsonApiResourceInterface[]
  ): void {
    const concatedData = included.concat(data);
    const concatedResources = document.included.concat(document.data);
    concatedResources.map((resource, index) => {
      const { relationships } = concatedData[index];
      Object.entries(relationships || {})
        .filter(([, value]) => !!value.data)
        .map(([name, value]) => {
          if (value.data instanceof Array) {
            resource[name] = value.data.map(identifier =>
              this.findResourceByIdentifier(identifier, concatedResources)
            );
          } else {
            resource[name] = this.findResourceByIdentifier(value.data, concatedResources);
          }
        });
    });
  }

  private extractRelationshipsIdentifiers(
    relationships: JsonApiRelationships
  ): JsonApiRelationships<JsonApiIdentifierInterface> {
    return Object.entries(relationships).reduce((acc, [name, { data }]) => {
      if (data instanceof Array) {
        return {
          ...acc,
          [name]: {
            data: data.map(({ type, id }) => ({ type, id }))
          }
        };
      } else {
        return {
          ...acc,
          [name]: {
            data: data ? { type: data.type, id: data.id } : null
          }
        };
      }
    }, {});
  }
}
