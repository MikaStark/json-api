import { Document } from './document';
import { Meta } from '../interfaces/meta';
import { Error } from '../interfaces/error';

export class DocumentError extends Document {
  constructor(
    public errors: Error[],
    public meta: Meta,
  ) {
    super(null, meta);
  }
}
