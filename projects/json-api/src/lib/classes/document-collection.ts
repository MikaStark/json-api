import { Resource } from './resource';
import { Document } from './document';
import { Links } from '../interfaces/links';
import { Meta } from '../interfaces/meta';

export class DocumentCollection<R extends Resource = Resource> extends Document {
  constructor(
    public data: R[] = [],
    public included: Resource[] = [],
    public meta: Meta = {},
    public links: Links = {},
    public jsonapi: any = {}
  ) {
    super(data, included, meta, links, jsonapi);
  }
}
