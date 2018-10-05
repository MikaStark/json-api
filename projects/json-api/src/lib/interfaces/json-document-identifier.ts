import { JsonIdentifier } from './json-identifier';
import { JsonDocument } from './json-document';

export interface JsonDocumentIdentifier extends JsonDocument {
  data: JsonIdentifier;
}
