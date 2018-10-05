import { Resource } from './resource';
import { Document } from './document';
import { Meta } from '../interfaces/meta';
import { JsonDocumentResources } from '../interfaces';

export class DocumentResources<R extends Resource = Resource> extends Document implements JsonDocumentResources {
  constructor(
    public data: R[],
    public meta: Meta
  ) {
    super(data, meta);
  }
}
