import { Injectable, Inject } from '@angular/core';
import { Identifier } from './classes/identifier';
import { Resource, DocumentIdentifier, DocumentIdentifiers, DocumentResource, DocumentResources, Document, Service } from './classes';
import { JSON_API_URL } from './json-api-url';
import { JsonApiRegisterService } from '../public_api';
import { JsonApiParametersService } from './json-api-parameters.service';
import { HttpClient } from '@angular/common/http';
import { JsonDocumentIdentifier } from './interfaces/json-document-identifier';
import { JsonDocumentIdentifiers } from './interfaces/json-document-identifiers';
import { JsonDocumentResource } from './interfaces/json-document-resource';
import { JsonDocumentResources } from './interfaces/json-document-resources';
import { JsonResource } from './interfaces/json-resource';

@Injectable({
  providedIn: 'root'
})
export class JsonApiFactoryService {
  constructor(
    @Inject(JSON_API_URL) public readonly url: string,
    public readonly register: JsonApiRegisterService,
    public readonly http: HttpClient,
    public readonly params: JsonApiParametersService,
  ) { }

  private findResource(identifier: Identifier, document: Document): Resource {
    const data = document.data as Resource | Resource[];
    let relationship = document.included
      .concat(data || [])
      .find(included => included.id === identifier.id && included.type === identifier.type);
    if (!relationship) {
      relationship = this.resource(identifier.id, identifier.type);
      relationship.meta = identifier.meta;
    }
    return relationship;
  }

  private populate(resource: Resource, document: Document): void {
    for (const name in resource.relationships) {
      if (Array.isArray(resource.relationships[name].data)) {
        const relationships = resource.relationships[name].data as Identifier[];
        resource.relationships[name].data = relationships.map(data => this.findResource(data, document));
      } else {
        const relationship = resource.relationships[name].data as Identifier;
        resource.relationships[name].data = this.findResource(relationship, document);
      }
    }
  }

  private buildIncludedResources(included: JsonResource[]): Resource[] {
    return included.map(resource => {
      const includedData = this.resource(resource.id, resource.type);
      includedData.attributes = resource.attributes;
      if (resource.relationships) {
        includedData.relationships = resource.relationships as any;
      }
      includedData.links = resource.links;
      includedData.meta = resource.meta;
      return includedData;
    });
  }

  documentWithOneIdentifier(document: JsonDocumentIdentifier): DocumentIdentifier {
    const data = this.identifier(document.data.id, document.data.type);
    data.meta = document.data.meta;
    const documentIdentifier = new DocumentIdentifier(data, document.meta);
    documentIdentifier.links = document.links;
    documentIdentifier.jsonapi = document.jsonapi;
    return documentIdentifier;
  }

  documentWithManyIdentifiers(document: JsonDocumentIdentifiers): DocumentIdentifiers {
    const documentIdentifiers = new DocumentIdentifiers(
      document.data.map(resource => {
        const data = this.identifier(resource.id, resource.type);
        data.meta = resource.meta;
        return data;
      }),
      document.meta
    );
    documentIdentifiers.links = document.links;
    documentIdentifiers.jsonapi = document.jsonapi;
    return documentIdentifiers;
  }

  documentWithOneResource(document: JsonDocumentResource): DocumentResource {
    const data = this.resource(document.data.id, document.data.type);
    data.attributes = document.data.attributes;
    data.links = document.data.links;
    data.meta = document.data.meta;

    const documentResource = new DocumentResource(data, document.meta);

    if (document.data.relationships) {
      data.relationships = document.data.relationships as any;
    }

    if (document.included) {
      documentResource.included = this.buildIncludedResources(document.included);
      documentResource.included.map(resource => this.populate(resource, documentResource));
      if (data.relationships) {
        this.populate(data, documentResource);
      }
    }

    documentResource.links = document.links;
    documentResource.jsonapi = document.jsonapi;
    return documentResource;
  }

  documentWithManyResources(document: JsonDocumentResources): DocumentResources {
    const documentResources = new DocumentResources(null, document.meta);
    documentResources.links = document.links;
    documentResources.jsonapi = document.jsonapi;

    documentResources.data = document.data.map(resource => {
      const data = this.resource(resource.id, resource.type);
      data.attributes = resource.attributes;
      data.links = resource.links;
      data.meta = resource.meta;
      if (resource.relationships) {
        data.relationships = resource.relationships as any;
      }
      return data;
    });

    if (document.included) {
      documentResources.included = this.buildIncludedResources(document.included);
      documentResources.included.map(resource => this.populate(resource, documentResources));
      documentResources.data
        .filter(resource => !!resource.relationships)
        .map(resource => this.populate(resource, documentResources));
    }

    return documentResources;
  }

  resource(id: string, type: string): Resource {
    const resourceType = this.register.get(type);
    return new resourceType(id, type, this.url, this.http, this.params, this);
  }

  identifier(id: string, type: string): Identifier {
    return new Identifier(id, type, this.url, this.http, this.params, this);
  }
}
