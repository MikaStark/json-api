import { JsonIdentifier } from './json-identifier';
import { JsonDocument } from './json-document';

export interface JsonDocumentIdentifiers extends JsonDocument {
  data: JsonIdentifier[];
}
