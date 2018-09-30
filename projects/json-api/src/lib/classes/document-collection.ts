import { Resource } from './resource';
import { Document } from './document';

export class DocumentCollection<R extends Resource = Resource> extends Document {
  data: R[] = [];
}
