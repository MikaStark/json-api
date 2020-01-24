import { JsonApiResource } from '../classes/json-api-resource';
import { JsonApiAttributeMetadata } from '../interfaces/json-api-attribute-metadata';

export interface AttributeOptions {
  key?: string;
  convert?: (value: any) => any;
  revert?: (value: any) => any;
}

export function Attribute({ key, convert, revert }: AttributeOptions = {}): PropertyDecorator {
  return (target: JsonApiResource, propertyName: string) => {
    const meta: JsonApiAttributeMetadata[] = Reflect.getMetadata('attributes', target) || [];

    meta.push({
      propertyName,
      convert,
      revert,
      key: key || propertyName
    });

    Reflect.defineMetadata('attributes', meta, target);
  };
}
