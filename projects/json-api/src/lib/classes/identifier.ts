import { Meta, JsonIdentifier } from '../interfaces';

export class Identifier implements JsonIdentifier {
  meta: Meta;

  constructor(
    public id: string = '',
    public type: string = '',
  ) { }
}
