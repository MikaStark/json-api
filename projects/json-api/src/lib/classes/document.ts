import { Identifier } from './identifier';
import { Meta } from '../interfaces/meta';
import { Links } from '../interfaces/links';
import { JsonDocument } from '../interfaces/json-document';
import { Resource } from './resource';

export class Document {
  data: Resource|Resource[]|Identifier|Identifier[];
  meta: Meta;
  included?: Resource[];
  links: Links;
  jsonapi: {version: string; meta: Meta};

  constructor(document: JsonDocument) {
    this.meta = document.meta;
    this.links = document.links;
    this.jsonapi = document.jsonapi;
  }
}
