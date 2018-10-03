import { Resource } from './resource';
import { Document } from './document';
import { Meta } from '../interfaces/meta';

export class DocumentCollection<R extends Resource = Resource> extends Document {
  constructor(
    public data: R[],
    public meta: Meta
  ) {
    super(data, meta);
  }
}
