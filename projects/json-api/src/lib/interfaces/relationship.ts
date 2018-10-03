import { Resource } from '../classes/resource';
import { Links } from './links';

 export interface Relationship<R extends Resource = Resource> {
   data: R;
   links: Links;
 }
