import { Injectable } from '@angular/core';
import { Resource } from './classes/resource';

@Injectable({
  providedIn: 'root'
})
export class JsonApiRegisterService {

  private types: {[name: string]: typeof Resource} = {};

  setMany(types: {[name: string]: typeof Resource}) {
    for (const name in types) {
      if (types[name] && !this.types[name]) {
        this.types[name] = types[name];
      }
    }
  }

  set(name: string, type: typeof Resource): void {
    this.types[name] = type;
  }

  get(name: string): typeof Resource {
    return this.types[name] || Resource;
  }
}
