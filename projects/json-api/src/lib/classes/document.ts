import { JsonDocument, Links, Meta } from '../interfaces';
import { Resource } from '.';
import { Identifier } from './identifier';

export class Document implements JsonDocument {
  included: Resource[];
  links: Links;
  jsonapi: {version: string; meta: Meta};

  constructor(
    public data: Resource|Resource[]|Identifier|Identifier[],
    public meta: Meta
  ) { }
}
