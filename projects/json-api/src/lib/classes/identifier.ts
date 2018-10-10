import { Meta } from '../interfaces/meta';
import { JsonIdentifier } from '../interfaces/json-identifier';
import { JsonApiModule } from '../json-api.module';

export class Identifier implements JsonIdentifier {
  constructor(
    public id: string,
    public type: string,
    public meta: Meta = {}
  ) { }

  protected get url(): string {
    return `${JsonApiModule.url}/${this.type}`;
  }
}
