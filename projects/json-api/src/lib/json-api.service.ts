import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonApiParametersService } from './json-api-parameters.service';
import { JSON_API_URL } from './json-api-url';
import { Resource } from './classes/resource';
import { Document } from './classes/document';
import { DocumentResource } from './classes/document-resource';
import { DocumentCollection } from './classes/document-collection';

@Injectable()
export class JsonApiService {

  static url: string = null;
  static http: HttpClient = null;
  static params: JsonApiParametersService = null;

  constructor(
    @Inject(JSON_API_URL) url: string,
    http: HttpClient,
    params: JsonApiParametersService,
  ) {
    JsonApiService.url = url;
    JsonApiService.http = http;
    JsonApiService.params = params;
  }

  private static populate(resource: Resource, document: Document): void {
    resource.attributes = document.included
      .find(included => included.id === resource.id && included.type === resource.type);
  }

  private static populateResource(resourceToPopulate: Resource, document: Document): void {
    if (!document.included) {
      return;
    }
    for (const name in resourceToPopulate.relationships) {
      if (resourceToPopulate.relationships[name]) {
        const relationship = resourceToPopulate.relationships[name];
        if (relationship instanceof DocumentResource) {
          const resource = relationship.data;
          this.populate(resource, document);
        } else if (relationship instanceof DocumentCollection) {
          const resources = relationship.data;
          resources.map(resource => this.populate(resource, document));
        }
      }
    }
  }

   static populateDocumentResource(document: DocumentResource): void {
    this.populateResource(document.data, document);
  }

   static populateDocumentCollection(document: DocumentCollection): void {
    document.data.map(resource => this.populateResource(resource, document));
  }
}
