import { Document } from './document';
import { Meta } from '../interfaces/meta';
import { Identifier } from './identifier';
import { JsonDocumentIdentifiers } from '../interfaces';

export class DocumentIdentifiers extends Document implements JsonDocumentIdentifiers {
  constructor(
    public data: Identifier[],
    public meta: Meta
  ) {
    super(data, meta);
  }
}
