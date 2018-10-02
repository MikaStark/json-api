import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonApiParametersService } from './json-api-parameters.service';
import { JSON_API_URL } from './json-api-url';
import { Resource } from './classes/resource';
import { Document } from './classes/document';
import { DocumentResource } from './classes/document-resource';
import { DocumentCollection } from './classes/document-collection';

@Injectable({
  providedIn: 'root'
})
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
    const relationship = document.included
      .concat(document.data || [])
      .find(included => included.id === resource.id && included.type === resource.type);
    if (relationship) {
      resource.attributes = relationship.attributes;
      resource.relationships = relationship.relationships;
      resource.links = relationship.links;
    }
  }

  private static populateResource(resourceToPopulate: Resource, document: Document): void {
    for (const name in resourceToPopulate.relationships) {
      if (resourceToPopulate.relationships[name]) {
        const relationship = resourceToPopulate.relationships[name];
        if (Array.isArray(relationship.data)) {
          const resources = relationship.data;
          resources.map(resource => this.populate(resource, document));
        } else {
          const resource = relationship.data;
          this.populate(resource, document);
        }
      }
    }
  }

  private static populateIncluded(document: Document): void {
    (document.included || []).map(resource => this.populateResource(resource, document));
  }

  static populateDocumentResource(document: DocumentResource): void {
    this.populateIncluded(document);
    this.populateResource(document.data, document);
  }

  static populateDocumentCollection(document: DocumentCollection): void {
    this.populateIncluded(document);
    document.data.map(resource => this.populateResource(resource, document));
  }
}
