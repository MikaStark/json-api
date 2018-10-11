import { Meta } from '../interfaces/meta';
import { Resource } from './resource';
import { Links } from '../interfaces/links';
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

  protected findResource(id: string, type: string, meta: Meta): Resource {
    let relationship = this.included
      .concat(this.data || [])
      .find(included => included.id === id && included.type === type);
    if (!relationship) {
      relationship = new Resource(id, type, meta);
    }
    return relationship;
  }

  protected populate(resource: Resource): void {
    for (const name in resource.relationships) {
      if (Array.isArray(resource.relationships[name].data)) {
        const relationships = resource.relationships[name].data as Resource[];
        resource.relationships[name].data = relationships.map(data => this.findResource(data.id, data.type, data.meta));
      } else if (resource.relationships[name].data) {
        const relationship = resource.relationships[name].data as Resource;
        resource.relationships[name].data = this.findResource(relationship.id, relationship.type, relationship.meta);
      }
    }
  }
}
