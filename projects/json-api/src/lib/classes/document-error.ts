import { Document } from './document';
import { Meta } from '../interfaces/meta';

export class DocumentError extends Document {
  constructor(
    public errors: Error[],
    public meta: Meta,
  ) {
    super(null, meta);
  }
}
