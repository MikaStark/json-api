import { Resource } from './resource';
import { Meta } from '../interfaces/meta';
import { Links } from '../interfaces/links';
import { Identifier } from './identifier';

export class Document {
  public included: Resource[];
  public links: Links;
  public jsonapi: {version: string; meta: Meta};

  constructor(
    public data: Resource|Resource[]|Identifier|Identifier[],
    public meta: Meta
  ) { }
}
