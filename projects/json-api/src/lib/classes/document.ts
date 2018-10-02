import { Resource } from './resource';
import { Meta } from '../interfaces/meta';
import { Links } from '../interfaces/links';

export class Document {
  constructor(
    public data: Resource|Resource[] = null,
    public included: Resource[] = [],
    public meta: Meta = {},
    public links: Links = {},
    public jsonapi: any = {}
  ) { }
}
