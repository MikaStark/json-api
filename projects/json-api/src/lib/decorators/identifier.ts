import { JsonApiIdentifier } from '../classes/json-api-identifier';

export interface IdentifierOptions {
  type: string;
}

export function Identifier(options: IdentifierOptions): ClassDecorator {
  return (target: any) => {
    const models = Reflect.getMetadata('models', JsonApiIdentifier) || {};

    models[options.type] = target;

    Reflect.defineMetadata('models', models, JsonApiIdentifier);
    Reflect.defineMetadata('models', options, target);
  };
}
