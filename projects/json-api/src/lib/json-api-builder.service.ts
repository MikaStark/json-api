import { Relationships } from './interfaces';
import { Injectable } from '@angular/core';
import { Resource } from './classes/resource';
import { Document } from './classes/document';
import { DocumentCollection } from './classes/document-collection';
import { DocumentResource } from './classes/document-resource';

@Injectable({
  providedIn: 'root'
})
export class JsonApiBuilderService {
  private findRelationship(resource: Resource, document: Document): Resource {
    const relationship = document.included
      .concat(document.data || [])
      .find(included => included.id === resource.id && included.type === resource.type);
    return relationship || resource;
  }

  private populate(resource: Resource, document: Document): void {
    for (const name in resource.relationships) {
      if (Array.isArray(resource.relationships[name].data)) {
        const relationships = resource.relationships[name] as DocumentCollection;
        relationships.data = relationships.data.map(data => this.findRelationship(data, document));
      } else {
        const relationship = resource.relationships[name] as DocumentResource;
        relationship.data = this.findRelationship(relationship.data, document);
      }
    }
  }

  private relationships(relationships: Relationships): Relationships {
    const newRelationships: Relationships = {};
    for (const name in relationships) {
      if (Array.isArray(relationships[name].data)) {
        const collection = relationships[name] as DocumentCollection;
        newRelationships[name] = new DocumentCollection(
          collection.data.map(relationship => new Resource(
            relationship.id,
            relationship.type,
            relationship.attributes,
            relationship.relationships,
            relationship.links
          )),
          collection.included,
          collection.meta,
          collection.links,
          collection.jsonapi
        );
      } else {
        const relationship = relationships[name] as DocumentResource;
        newRelationships[name] = new DocumentResource(
          new Resource(
            relationship.data.id,
            relationship.data.type,
            relationship.data.attributes,
            relationship.data.relationships,
            relationship.data.links
          ),
          relationship.included,
          relationship.meta,
          relationship.links,
          relationship.jsonapi
        );

      }
    }
    return newRelationships;
  }

  resource(
    document: DocumentResource,
    resourceType: typeof Resource = Resource
  ): DocumentResource {
    const included = document.included || [];
    const documentResource = new DocumentResource(
      new resourceType(
        document.data.id,
        document.data.type,
        document.data.attributes,
        this.relationships(document.data.relationships),
        document.data.links
      ),
      included.map(resource => new Resource(
        resource.id,
        resource.type,
        resource.attributes,
        this.relationships(resource.relationships),
        resource.links,
      )),
      document.meta,
      document.links,
      document.jsonapi
    );
    documentResource.included.map(resource => this.populate(resource, documentResource));
    this.populate(documentResource.data, documentResource);
    return documentResource;
  }

  collection(
    document: DocumentCollection,
    resourceType: typeof Resource = Resource
  ): DocumentCollection {
    const included = document.included || [];
    const documentCollection = new DocumentCollection(
      document.data.map(resource => new resourceType(
        resource.id,
        resource.type,
        resource.attributes,
        this.relationships(resource.relationships),
        resource.links
      )),
      included.map(resource => new Resource(
        resource.id,
        resource.type,
        resource.attributes,
        this.relationships(resource.relationships),
        resource.links,
      )),
      document.meta,
      document.links,
      document.jsonapi
    );
    documentCollection.included.map(resource => this.populate(resource, documentCollection));
    documentCollection.data.map(resource => this.populate(resource, documentCollection));
    return documentCollection;
  }
}
