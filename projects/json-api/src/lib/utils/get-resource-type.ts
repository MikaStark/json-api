import { JsonApiResource } from '../classes';

export function getResourceType(type: string): typeof JsonApiResource {
  const metadata = Reflect.getMetadata('resourceType', JsonApiResource);
  const resourceType = metadata[type];
  if (!resourceType) {
    throw new Error(`Type "${type}" is not a JSONAPI resource type`);
  }
  return resourceType;
}
