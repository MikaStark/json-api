import { DocumentCollection } from '../classes/document-collection';
import { DocumentResource } from '../classes/document-resource';

export interface Relationships {
  [name: string]: DocumentCollection | DocumentResource;
}
