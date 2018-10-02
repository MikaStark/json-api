import { Resource } from '../classes/resource';

export interface RelationshipsDeclaration {
  [name: string]: typeof Resource;
}
