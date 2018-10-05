import { Document } from './document';
import { Meta } from '../interfaces/meta';
import { Identifier } from './identifier';
import { JsonDocumentIdentifier } from '../interfaces';

export class DocumentIdentifier extends Document implements JsonDocumentIdentifier {
  constructor(
    public data: Identifier,
    public meta: Meta
  ) {
    super(data, meta);
  }
}
