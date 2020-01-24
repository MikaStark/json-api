import { JsonApiResource } from '../classes/json-api-resource';

export interface ResourceOptions {
  type: string;
}

export function Resource(options: ResourceOptions): ClassDecorator {
  return (target: any) => {
    const models = Reflect.getMetadata('models', JsonApiResource) || {};

    models[options.type] = target;

    Reflect.defineMetadata('models', models, JsonApiResource);
    Reflect.defineMetadata('models', options, target);
  };
}
