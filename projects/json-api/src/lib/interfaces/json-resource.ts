import { JsonIdentifier } from './json-identifier';
import { Meta } from './meta';
import { Links } from './links';

export interface JsonResource extends JsonIdentifier {
  attributes: any;
  relationships: {[name: string]: {
    data: JsonIdentifier|JsonIdentifier[],
    links: Links
  }};
  meta: Meta;
  links: Links;
}
