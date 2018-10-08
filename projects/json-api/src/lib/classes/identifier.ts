import { Meta, JsonIdentifier } from '../interfaces';
import { HttpClient } from '@angular/common/http';
import { JsonApiParametersService } from '../json-api-parameters.service';
import { JsonApiFactoryService } from '../json-api-factory.service';

export class Identifier implements JsonIdentifier {
  meta: Meta;

  constructor(
    public id: string = '',
    public type: string = '',
    protected apiUrl: string,
    protected http: HttpClient,
    protected params: JsonApiParametersService,
    protected factory: JsonApiFactoryService
  ) { }

  protected get url(): string {
    return `${this.apiUrl}/${this.type}`;
  }
}
