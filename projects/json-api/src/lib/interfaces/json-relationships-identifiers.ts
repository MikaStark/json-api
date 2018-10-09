import { JsonIdentifier } from './json-identifier';

export interface JsonRelationshipsIdentifiers {
  [name: string]: {
    data: JsonIdentifier|JsonIdentifier[]
  };
}
