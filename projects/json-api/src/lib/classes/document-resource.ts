import { Resource } from './resource';
import { Document } from './document';
import { Meta } from '../interfaces/meta';
import { JsonDocumentResource } from '../interfaces';

export class DocumentResource<R extends Resource = Resource> extends Document implements JsonDocumentResource {
  constructor(
    public data: R,
    public meta: Meta
  ) {
    super(data, meta);
  }
}
