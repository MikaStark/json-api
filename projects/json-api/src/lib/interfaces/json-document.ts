import { JsonResource } from './json-resource';
import { JsonIdentifier } from './json-identifier';
import { Meta } from './meta';
import { Links } from '.';
import { Jsonapi } from './jsonapi';
import { Error } from './error';

export interface JsonDocument {
  data?: JsonResource|JsonResource[]|JsonIdentifier|JsonIdentifier[];
  errors?: Error[];
  meta: Meta;
  included?: JsonResource[];
  links: Links;
  jsonapi: Jsonapi;
}
