import { JsonDocument } from './json-document';
import { Error } from './error';

export interface JsonDocumentErrors extends JsonDocument {
  errors: Error[];
}
