import { Identifier } from './identifier';
import { Meta } from '../interfaces/meta';
import { Links } from '../interfaces/links';
import { JsonDocument } from '../interfaces/json-document';
import { Resource } from './resource';
import { Jsonapi } from '../interfaces/jsonapi';
import { Error } from '../interfaces/error';

export class Document {
  data?: Resource|Resource[]|Identifier|Identifier[];
  errors: Error[];
  meta: Meta;
  included?: Resource[];
  links: Links;
  jsonapi: Jsonapi;

  constructor(document: JsonDocument) {
    this.meta = document.meta;
    this.links = document.links;
    this.jsonapi = document.jsonapi;
  }
}
