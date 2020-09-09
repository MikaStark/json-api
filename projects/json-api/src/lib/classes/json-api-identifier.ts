import 'reflect-metadata';
import { JsonApiIdentifierInterface } from '../interfaces/json-api-identifier-interface';
import { JsonApiMeta } from '../interfaces/json-api-meta';

export interface JsonApiIdentifierConfig {
  id?: string;
  meta?: JsonApiMeta;
}

export class JsonApiIdentifier implements JsonApiIdentifierInterface {
  id: string;
  meta: JsonApiMeta;

  get type(): string {
    return Reflect.getMetadata('resourceType', this.constructor).type;
  }

  constructor({ id, meta }: JsonApiIdentifierConfig = {}) {
    this.id = id;
    this.meta = meta;
  }
}
