import { JsonResource } from './json-resource';
import { JsonDocument } from './json-document';

export interface JsonDocumentResource extends JsonDocument {
  data: JsonResource;
  included: JsonResource[];
}
