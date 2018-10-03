import { Resource } from '../classes/resource';

export interface ResourceTypes {
  [name: string]: typeof Resource;
}
