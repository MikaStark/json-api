import { Resource } from './resource';
import { Links } from '../interfaces/links';
import { Meta } from '../interfaces/meta';

export class Document {
  constructor(
    public data: Resource|Resource[] = null,
    public included: Resource[] = [],
    public meta: Meta = {},
    public links: Links = {},
    public jsonapi: any = {}
  ) { }
}
