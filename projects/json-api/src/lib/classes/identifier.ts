import { Meta, JsonIdentifier } from '../interfaces';
import { JsonApiService } from '../json-api.service';

export class Identifier implements JsonIdentifier {
  meta: Meta;

  constructor(
    public id: string = '',
    public type: string = ''
  ) { }

  protected get url(): string {
    return `${JsonApiService.url}/${this.type}`;
  }
}
