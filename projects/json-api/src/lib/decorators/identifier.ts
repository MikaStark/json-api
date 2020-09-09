import { JsonApiIdentifier } from '../classes/json-api-identifier';

export interface IdentifierOptions {
  type: string;
}

export function Identifier(options: IdentifierOptions): ClassDecorator {
  return (target: any) => {
    const models = Reflect.getMetadata('resourceType', JsonApiIdentifier) || {};

    models[options.type] = target;

    Reflect.defineMetadata('resourceType', models, JsonApiIdentifier);
    Reflect.defineMetadata('resourceType', options, target);
  };
}
