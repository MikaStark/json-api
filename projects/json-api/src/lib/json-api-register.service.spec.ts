import { TestBed } from '@angular/core/testing';

import { JsonApiRegisterService } from './json-api-register.service';
import { Resource } from './classes/resource';

describe('JsonApiRegisterService', () => {
  let service: JsonApiRegisterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(JsonApiRegisterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set resource type', () => {
    const resourceType = class Foo extends Resource {};
    service.set('foo', resourceType);
    expect(service.get('foo')).toEqual(resourceType);
  });

  it('should set many resource types', () => {
    const resourceTypes = {
      foo: class Foo extends Resource {},
      fake: class Fake extends Resource {}
    };
    service.setMany(resourceTypes);
    Object.keys(resourceTypes).map(name => expect(service.get(name)).toEqual(resourceTypes[name]));
  });
});
