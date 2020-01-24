import { JsonApiAttributes } from '../interfaces/json-api-attributes';
import { JsonApiRelationships } from '../interfaces/json-api-relationships';
import { JsonApiMeta } from '../interfaces/json-api-meta';
import { JsonApiLinks } from '../interfaces/json-api-links';
import { JsonApiResourceInterface } from '../interfaces/json-api-resource-interface';
import { JsonApiIdentifier, JsonApiIdentifierConfig } from './json-api-identifier';
import 'reflect-metadata';

export interface JsonApiResourceConfig extends JsonApiIdentifierConfig {
  attributes?: JsonApiAttributes;
  relationships?: JsonApiRelationships<any>;
  links?: JsonApiLinks;
}

export class JsonApiResource extends JsonApiIdentifier implements JsonApiResourceInterface {
  get meta(): JsonApiMeta {
    return Reflect.getMetadata('meta', this);
  }
  set meta(value: JsonApiMeta) {
    Reflect.defineMetadata('meta', value, this);
  }

  get links(): JsonApiLinks {
    return Reflect.getMetadata('links', this);
  }
  set links(value: JsonApiLinks) {
    Reflect.defineMetadata('links', value, this);
  }

  get attributes(): JsonApiAttributes {
    const definedAttributes = this._attributesMetadata.filter(
      ({ propertyName }) => this[propertyName] !== undefined
    );
    if (definedAttributes.length === 0) {
      return undefined;
    }
    return definedAttributes.reduce((attributes, { revert, propertyName, key }) => {
      const attribute = this[propertyName];
      return { ...attributes, [key]: revert ? revert(attribute) : attribute };
    }, {});
  }
  set attributes(attributes: JsonApiAttributes) {
    this._attributesMetadata
      .filter(({ key }) => attributes[key] !== undefined)
      .map(({ key, convert, propertyName }) => {
        const attribute = attributes[key];
        this[propertyName] = convert ? convert(attribute) : attribute;
      });
  }

  get relationships(): JsonApiRelationships {
    const definedRelationships = this._relationshipsMetadata.filter(
      ({ key }) => this[key] !== undefined
    );
    if (definedRelationships.length === 0) {
      return undefined;
    }
    return definedRelationships.reduce((relationships, { key }) => {
      const relationshipLinks = Reflect.getMetadata(`${key.toString()}:links`, this);
      const relationshipMeta = Reflect.getMetadata(`${key.toString()}:meta`, this);
      if (this[key] instanceof Array) {
        const data = this[key] as JsonApiResource[];
        const relationship = {
          data: data.filter(model => !!model.id).map(({ id, type, meta }) => ({ id, type, meta })),
          meta: relationshipMeta,
          links: relationshipLinks
        };
        return { ...relationships, [key]: relationship };
      } else {
        const data = this[key] as JsonApiResource;
        const relationship = {
          data: data ? { type: data.type, id: data.id, meta: data.meta } : null,
          meta: relationshipMeta,
          links: relationshipLinks
        };
        return { ...relationships, [key]: relationship };
      }
    }, {});
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
