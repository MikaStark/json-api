import { JsonApiResource } from '../classes/json-api-resource';

export interface ResourceOptions {
  type: string;
}

export function Resource(options: ResourceOptions): ClassDecorator {
  return (target: any) => {
    const models = Reflect.getMetadata('resourceType', JsonApiResource) || {};

    models[options.type] = target;

    Reflect.defineMetadata('resourceType', models, JsonApiResource);
    Reflect.defineMetadata('resourceType', options, target);
  };
}
