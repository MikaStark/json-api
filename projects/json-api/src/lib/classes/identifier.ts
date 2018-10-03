import { Meta } from '../interfaces';

export class Identifier {
  meta: Meta;

  constructor(
    public id: string = '',
    public type: string = '',
  ) { }
}
