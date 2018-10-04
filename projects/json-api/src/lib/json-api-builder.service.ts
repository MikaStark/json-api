import { Injectable } from '@angular/core';

import { DocumentResource } from './classes/document-resource';
import { DocumentResources } from './classes/document-resources';
import { Document } from './classes/document';
import { Identifier } from './classes/identifier';
import { DocumentIdentifier } from './classes/document-identifier';
import { DocumentIdentifiers } from './classes/document-identifiers';
import { Resource } from './classes/resource';
import { ResourceTypes } from './interfaces/resource-types';

@Injectable({
  providedIn: 'root'
})
export class JsonApiBuilderService {

  constructor() { }

  private types: ResourceTypes = {};

  private findResource(identifier: Identifier, document: Document): Resource {
    const data = document.data as Resource | Resource[];
    let relationship = document.included
      .concat(data || [])
      .find(included => included.id === identifier.id && included.type === identifier.type);
    if (!relationship) {
      relationship = new Resource(identifier.id, identifier.type);
      relationship.meta = identifier.meta;
    }
    return relationship;
  }

  private populate(resource: Resource, document: Document): void {
    for (const name in resource.relationships) {
      if (Array.isArray(resource.relationships[name].data)) {
        const relationships = resource.relationships[name].data as Resource[];
        resource.relationships[name].data = relationships.map(data => this.findResource(data, document));
      } else {
        const relationship = resource.relationships[name].data as Resource;
        resource.relationships[name].data = this.findResource(relationship, document);
      }
    }
  }

  private buildIncludedResources(included: Resource[]): Resource[] {
    return included.map(resource => {
      const includedData = this.resource(resource.id, resource.type);
      includedData.attributes = resource.attributes;
      if (resource.relationships) {
        includedData.relationships = resource.relationships;
      }
      includedData.links = resource.links;
      includedData.meta = resource.meta;
      return includedData;
    });
  }

  register(name: string, type: typeof Resource): void {
    this.types[name] = type;
  }

  resource(id: string, type: string): Resource {
    const resourceType = this.types[type];
    if (resourceType) {
      return new resourceType(id, type);
    }
    return new Resource(id, type);
  }

  documentIdentifier(document: DocumentIdentifier): DocumentIdentifier {
    const data = new Identifier(document.data.id, document.data.type);
    data.meta = document.data.meta;
    const documentIdentifier = new DocumentIdentifier(data, document.meta);
    documentIdentifier.links = document.links;
    documentIdentifier.jsonapi = document.jsonapi;
    return documentIdentifier;
  }

  documentIdentifiers(document: DocumentIdentifiers): DocumentIdentifiers {
    const documentIdentifiers = new DocumentIdentifiers(
      document.data.map(resource => {
        const data = new Identifier(resource.id, resource.type);
        data.meta = resource.meta;
        return data;
      }),
      document.meta
    );
    documentIdentifiers.links = document.links;
    documentIdentifiers.jsonapi = document.jsonapi;
    return documentIdentifiers;
  }

  documentResource(document: DocumentResource): DocumentResource {
    const data = this.resource(document.data.id, document.data.type);
    data.attributes = document.data.attributes;
    data.links = document.data.links;
    data.meta = document.data.meta;

    const documentResource = new DocumentResource(data, document.meta);

    if (document.included) {
      documentResource.included = this.buildIncludedResources(document.included);
      documentResource.included.map(resource => this.populate(resource, documentResource));
    }

    if (document.data.relationships) {
      data.relationships = document.data.relationships;
      this.populate(data, documentResource);
    }

    documentResource.links = document.links;
    documentResource.jsonapi = document.jsonapi;
    return documentResource;
  }

  documentResources(document: DocumentResources): DocumentResources {
    const documentResources = new DocumentResources(null, document.meta);
    documentResources.links = document.links;
    documentResources.jsonapi = document.jsonapi;

    if (document.included) {
      documentResources.included = this.buildIncludedResources(document.included);
      documentResources.included.map(resource => this.populate(resource, documentResources));
    }

    documentResources.data = document.data.map(resource => {
      const data = this.resource(resource.id, resource.type);
      data.attributes = resource.attributes;
      data.links = resource.links;
      data.meta = resource.meta;
      if (resource.relationships) {
        data.relationships = resource.relationships;
        this.populate(data, documentResources);
      }
      return data;
    });
    return documentResources;
  }
}
