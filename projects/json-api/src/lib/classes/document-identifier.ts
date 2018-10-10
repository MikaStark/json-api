import { Identifier } from './identifier';
import { JsonDocumentIdentifier } from '../interfaces/json-document-identifier';
import { DocumentOneOrManyIdentifiers } from './document-one-or-many-identifiers';

export class DocumentIdentifier extends DocumentOneOrManyIdentifiers implements JsonDocumentIdentifier {
  data: Identifier;

  constructor(document: JsonDocumentIdentifier) {
    super(document);
    this.data = new Identifier(document.data.id, document.data.type);
  }
}
