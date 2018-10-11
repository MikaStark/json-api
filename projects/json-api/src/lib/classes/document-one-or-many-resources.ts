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
    const resource = new resourceType(id, type, meta, attributes, null, links);
    if (relationships) {
      resource.relationships = relationships;
    }
    return resource;
  }

  protected findResource(resource: Resource): Resource {
    let relationship = this.included
      .concat(this.data || [])
      .find(included => included.id === resource.id && included.type === resource.type);
    if (!relationship) {
      relationship = new Resource(resource.id, resource.type, resource.meta);
    }
    return relationship;
  }

  protected populate(resource: Resource): void {
    for (const name in resource.relationships) {
      if (Array.isArray(resource.relationships[name].data)) {
        const relationships = resource.relationships[name].data as Resource[];
        resource.relationships[name].data = relationships.map(data => this.findResource(data));
      } else if (resource.relationships[name].data) {
        const relationship = resource.relationships[name].data as Resource;
        resource.relationships[name].data = this.findResource(relationship);
      }
    }
  }
}
