import { Resource } from '../classes/resource';
import { Links } from './links';

 export interface Relationship {
   data: Resource|Resource[];
   links: Links;
 }
