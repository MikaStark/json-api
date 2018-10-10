import { Identifier } from './identifier';
import { JsonDocumentIdentifiers } from '../interfaces/json-document-identifiers';
import { DocumentOneOrManyIdentifiers } from './document-one-or-many-identifiers';

export class DocumentIdentifiers extends DocumentOneOrManyIdentifiers implements JsonDocumentIdentifiers {
  data: Identifier[];

  constructor(document: JsonDocumentIdentifiers) {
    super(document);
    this.data = document.data.map(data => new Identifier(data.id, data.type));
  }
}
