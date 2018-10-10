import { Meta } from '../interfaces/meta';
import { Resource } from './resource';
import { Links } from '../interfaces/links';
import { Identifier } from './identifier';
import { Attributes } from '../interfaces/attributes';
import { JsonApiModule } from '../json-api.module';
import { Document } from './document';

export class DocumentOneOrManyResources extends Document {
  data: Resource|Resource[];
  included: Resource[];

  protected resource(
    id: string,
    type: string,
    meta: Meta,
    attributes: Attributes,
    relationships: any,
    links: Links
  ): Resource {
    const resourceType = JsonApiModule.register.get(type);
    return new resourceType(id, type, meta, attributes, relationships, links);
  }

  protected findResource(identifier: Identifier): Resource {
    let relationship = this.included
      .concat(this.data || [])
      .find(included => included.id === identifier.id && included.type === identifier.type);
    if (!relationship) {
      relationship = new Resource(identifier.id, identifier.type);
      relationship.meta = identifier.meta;
    }
    return relationship;
  }

  protected populate(resource: Resource): void {
    for (const name in resource.relationships) {
      if (Array.isArray(resource.relationships[name].data)) {
        const relationships = resource.relationships[name].data as Identifier[];
        resource.relationships[name].data = relationships.map(data => this.findResource(data));
      } else if (resource.relationships[name].data) {
        const relationship = resource.relationships[name].data as Identifier;
        resource.relationships[name].data = this.findResource(relationship);
      }
    }
  }
}
