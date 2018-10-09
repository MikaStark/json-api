import { Meta, JsonIdentifier } from '../interfaces';
import { JsonApiModule } from '../json-api.module';

export class Identifier implements JsonIdentifier {
  meta: Meta = {};

  constructor(
    public id: string = '',
    public type: string = ''
  ) { }

  protected get url(): string {
    return `${JsonApiModule.url}/${this.type}`;
  }
}
