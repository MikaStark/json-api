import { Identifier } from './identifier';
import { Document } from './document';

export class DocumentOneOrManyIdentifiers extends Document {
  data: Identifier|Identifier[];
}
