import { Meta, JsonIdentifier } from '../interfaces';
import { JsonApiFactoryService } from '../json-api-factory.service';

export class Identifier implements JsonIdentifier {
  meta: Meta;

  constructor(
    public id: string = '',
    public type: string = '',
    protected factory: JsonApiFactoryService
  ) { }

  protected get url(): string {
    return `${this.factory.url}/${this.type}`;
  }
}
