import { Resource } from './resource';

export class Document {
  data: Resource|Resource[];
  errors: any[] = [];
  meta: any;
  jsonapi: any;
  links: any;
  included: Resource[];
}
