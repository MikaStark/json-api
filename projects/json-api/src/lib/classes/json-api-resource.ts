import 'reflect-metadata';
import {
  JsonApiAttributeMetadata,
  JsonApiAttributes,
  JsonApiRelationship,
  JsonApiRelationshipMetadata,
  JsonApiRelationships,
} from '../interfaces';
import { JsonApiLinks } from '../interfaces/json-api-links';
import { JsonApiResourceInterface } from '../interfaces/json-api-resource-interface';
import { JsonApiIdentifier, JsonApiIdentifierConfig } from './json-api-identifier';

export interface JsonApiResourceConfig extends JsonApiIdentifierConfig {
  attributes?: JsonApiAttributes;
  relationships?: JsonApiRelationships;
  links?: JsonApiLinks;
}

export class JsonApiResource extends JsonApiIdentifier implements JsonApiResourceInterface {
  get links(): JsonApiLinks {
    return Reflect.getMetadata('links', this);
  }
  set links(value: JsonApiLinks) {
    Reflect.defineMetadata('links', value, this);
  }

  get attributes(): JsonApiAttributes {
    return this._attributesMetadata.reduce<JsonApiAttributes>(
      (attributes, { revert, propertyName, key }) => {
        const attribute = this[propertyName];
        if (attribute === undefined) {
          return attributes;
        }
        return { ...attributes, [key]: revert ? revert(attribute) : attribute };
      },
      undefined,
    );
  }
  set attributes(attributes: JsonApiAttributes) {
    this._attributesMetadata
      .filter(({ key }) => attributes[key.toString()] !== undefined)
      .map(({ key, convert, propertyName }) => {
        const attribute = attributes[key];
        this[propertyName] = convert ? convert(attribute) : attribute;
      });
  }

  get relationships(): JsonApiRelationships {
    return this._relationshipsMetadata.reduce<JsonApiRelationships>((relationships, { key }) => {
      if (this[key] === undefined) {
        return relationships;
      }
      const relationship: JsonApiRelationship = {};
      if (this[key] instanceof Array) {
        const data = this[key] as JsonApiResource[];
        relationship.data = data.map(({ id, type, meta }) =>
          !!meta ? { id, type, meta } : { id, type },
        );
      } else {
        const data = this[key] as JsonApiResource;
        if (data === null) {
          relationship.data = null;
        } else if (data.meta === undefined) {
          const { type, id } = data;
          relationship.data = { type, id };
        } else {
          const { type, id, meta } = data;
          relationship.data = { type, id, meta };
        }
      }
      const relationshipLinks = Reflect.getMetadata(`${key.toString()}:links`, this);
      if (relationshipLinks !== undefined) {
        relationship.links = relationshipLinks;
      }
      const relationshipMeta = Reflect.getMetadata(`${key.toString()}:meta`, this);
      if (relationshipMeta !== undefined) {
        relationship.meta = relationshipMeta;
      }
      return { ...relationships, [key]: relationship };
    }, undefined);
  }
  set relationships(relationships: JsonApiRelationships) {
    this._relationshipsMetadata
      .filter(({ key }) => relationships[key.toString()] !== undefined)
      .map(({ propertyName, key }) => {
        const { data, meta, links } = relationships[key.toString()];
        this[propertyName] = data;
        Reflect.defineMetadata(`${propertyName.toString()}:meta`, meta, this);
        Reflect.defineMetadata(`${propertyName.toString()}:links`, links, this);
      });
  }

  protected get _attributesMetadata(): JsonApiAttributeMetadata[] {
    return Reflect.getMetadata('attributes', this) || [];
  }

  protected get _relationshipsMetadata(): JsonApiRelationshipMetadata[] {
    return Reflect.getMetadata('relationships', this) || [];
  }

  constructor({ id, attributes, relationships, meta, links }: JsonApiResourceConfig = {}) {
    super({ id, meta });
    this.links = links;
    if (attributes) {
      this.attributes = attributes;
    }
    if (relationships) {
      this.relationships = relationships;
    }
  }
}
