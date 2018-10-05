import { JsonResource } from './json-resource';
import { JsonDocument } from './json-document';

export interface JsonDocumentResources extends JsonDocument {
  data: JsonResource[];
  included: JsonResource[];
}
