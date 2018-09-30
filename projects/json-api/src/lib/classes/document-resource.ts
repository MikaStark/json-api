import { Resource } from './resource';
import { Document } from './document';

export class DocumentResource<R extends Resource = Resource> extends Document {
  data: R;
}
