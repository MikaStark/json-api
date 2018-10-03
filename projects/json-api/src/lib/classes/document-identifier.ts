import { Document } from './document';
import { Meta } from '../interfaces/meta';
import { Identifier } from './identifier';

export class DocumentIdentifier extends Document {
  constructor(
    public data: Identifier,
    public meta: Meta
  ) {
    super(data, meta);
  }
}
