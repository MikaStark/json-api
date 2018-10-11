import { Document } from './document';
import { JsonDocumentErrors } from '../interfaces/json-document-errors';

export class DocumentErrors extends Document {
  constructor(document: JsonDocumentErrors) {
    super(document);
    this.errors = document.errors;
  }
}
