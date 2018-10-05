import { JsonResource } from './json-resource';
import { JsonIdentifier } from './json-identifier';
import { Meta } from './meta';
import { Links } from '.';
import { Jsonapi } from './jsonapi';

export interface JsonDocument {
  data: JsonResource|JsonResource[]|JsonIdentifier|JsonIdentifier[];
  meta: Meta;
  links: Links;
  jsonapi: Jsonapi;
}
