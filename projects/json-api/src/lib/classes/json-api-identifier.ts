import { JsonApiAttributeMetadata } from '../interfaces/json-api-attribute-metadata';
import { JsonApiRelationshipMetadata } from '../interfaces/json-api-relationship-metadata';
import { JsonApiMeta } from '../interfaces/json-api-meta';
import { JsonApiIdentifierInterface } from '../interfaces/json-api-identifier-interface';
import 'reflect-metadata';

export interface JsonApiIdentifierConfig {
  id?: string;
  meta?: JsonApiMeta;
}

export class JsonApiIdentifier implements JsonApiIdentifierInterface {
  id: string;

  protected get _attributesMetadata(): JsonApiAttributeMetadata[] {
    return Reflect.getMetadata('attributes', this) || [];
  }

  protected get _relationshipsMetadata(): JsonApiRelationshipMetadata[] {
    return Reflect.getMetadata('relationships', this) || [];
  }

  get type(): string {
    const meta = Reflect.getMetadata('models', this.constructor);
    return meta ? meta.type : undefined;
  }

  get meta(): JsonApiMeta {
    return Reflect.getMetadata('meta', this);
  }
  set meta(value: JsonApiMeta) {
    Reflect.defineMetadata('meta', value, this);
  }

  constructor({ id, meta }: JsonApiIdentifierConfig = {}) {
    this.id = id;
    this.meta = meta;
  }
}
