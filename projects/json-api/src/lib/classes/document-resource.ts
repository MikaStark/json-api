import { Resource } from './resource';
import { JsonDocumentResource } from '../interfaces/json-document-resource';
import { DocumentOneOrManyResources } from './document-one-or-many-resources';

export class DocumentResource<R extends Resource = Resource> extends DocumentOneOrManyResources implements JsonDocumentResource {
  data: R;

  constructor(document: JsonDocumentResource) {
    super(document);
    this.data = this.resource(
      document.data.id,
      document.data.type,
      document.data.meta,
      document.data.attributes,
      document.data.relationships,
      document.data.links
    ) as R;

    if (document.included) {
      this.included = document.included.map(resource => this.resource(
        resource.id,
        resource.type,
        resource.meta,
        resource.attributes,
        resource.relationships,
        resource.links
      ));
      this.included.map(resource => this.populate(resource));
      if (this.data.relationships) {
        this.populate(this.data);
      }
    }
  }
}
