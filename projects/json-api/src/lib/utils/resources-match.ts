import { JsonApiIdentifierInterface } from '../interfaces';

export const resourcesMatch = (
  resource1: JsonApiIdentifierInterface,
  resource2: JsonApiIdentifierInterface
): boolean =>
  resource1 && resource2 && resource1.id === resource2.id && resource1.type === resource2.type;
