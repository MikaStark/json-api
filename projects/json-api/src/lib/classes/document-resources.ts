import { Resource } from './resource';
import { JsonDocumentResources } from '../interfaces/json-document-resources';
import { DocumentOneOrManyResources } from './document-one-or-many-resources';

export class DocumentResources<R extends Resource = Resource> extends DocumentOneOrManyResources implements JsonDocumentResources {
  data: R[];

  constructor(document: JsonDocumentResources) {
    super(document);
    this.data = document.data.map(data => this.resource(
      data.id,
      data.type,
      data.meta,
      data.attributes,
      data.relationships,
      data.links
    ) as R);

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
      this.data
        .filter(resource => !!resource.relationships)
        .map(resource => this.populate(resource));
    }
  }
}
