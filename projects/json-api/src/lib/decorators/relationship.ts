import { JsonApiResource } from '../classes/json-api-resource';
import { JsonApiRelationshipMetadata } from '../interfaces/json-api-relationship-metadata';

export interface RelationshipOptions {
  key?: string;
}

export function Relationship({ key }: RelationshipOptions = {}): PropertyDecorator {
  return (target: JsonApiResource, propertyName: string | symbol) => {
    const meta: JsonApiRelationshipMetadata[] = Reflect.getMetadata('relationships', target) || [];

    meta.push({
      propertyName,
      key: key || propertyName
    });

    Reflect.defineMetadata('relationships', meta, target);
  };
}
