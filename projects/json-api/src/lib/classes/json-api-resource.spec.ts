import { Attribute, Relationship, Resource } from '../decorators';
import { JsonApiResource } from './json-api-resource';

@Resource({
  type: 'foos',
})
class Foo extends JsonApiResource {
  @Attribute() string: string;
  @Attribute() number: number;
  @Attribute() boolean: boolean;
  @Attribute() object: {};
  @Attribute() array: any[];

  @Relationship() foo: Foo;
  @Relationship() foos: Foo[];
}

describe('JsonApiResource', () => {
  it('should create an instance', () => {
    expect(new JsonApiResource()).toBeTruthy();
  });

  it('should not have a type without decorators', () => {
    const resource = new JsonApiResource();
    expect(resource.type).toBeUndefined();
  });

  it('should have a type', () => {
    const resource = new Foo();
    expect(resource.type).toEqual('foos');
  });

  it('should create an instance with id', () => {
    const id = '1';
    const resource = new Foo({ id });
    expect(resource.id).toBeTruthy();
    expect(resource.id).toEqual(id);
  });

  it('should create an instance with attributes', () => {
    const attributes = {
      string: 'hello',
      number: 5,
      boolean: false,
      object: {},
      array: [],
    };
    const resource = new Foo({ attributes });
    expect(resource.attributes).toBeTruthy();
    expect(resource.attributes).toEqual(attributes);
  });

  it('should create an instance with relationships', () => {
    const relationships = {
      foo: {
        data: new Foo({ id: '1' }),
        meta: { foo: 1 },
        links: { self: '...', related: '...' },
      },
      foos: {
        data: [new Foo({ id: '2' })],
        meta: { foo: 2 },
        links: { self: '...', related: '...' },
      },
    };
    const resource = new Foo({ relationships });
    expect(resource.relationships).toBeTruthy();
    expect(resource.relationships.foo).toBeTruthy();
    expect(resource.relationships.foo.data).toEqual({
      type: relationships.foo.data.type,
      id: relationships.foo.data.id,
      meta: relationships.foo.data.meta,
    });
    expect(resource.relationships.foo.meta).toEqual(relationships.foo.meta);
    expect(resource.relationships.foo.links).toEqual(relationships.foo.links);
    expect(resource.relationships.foos.data).toEqual(
      relationships.foos.data.map(foo => ({
        type: foo.type,
        id: foo.id,
        meta: foo.meta,
      })),
    );
    expect(resource.relationships.foos.meta).toEqual(relationships.foos.meta);
    expect(resource.relationships.foos.links).toEqual(relationships.foos.links);
  });

  it('should create an instance with meta', () => {
    const meta = {
      createdFor: 'test',
    };
    const resource = new Foo({ meta });
    expect(resource.meta).toBeTruthy();
    expect(resource.meta).toEqual(meta);
  });

  it('should create an instance with links', () => {
    const links = {
      self: '...',
      related: '...',
    };
    const resource = new Foo({ links });
    expect(resource.links).toBeTruthy();
    expect(resource.links).toEqual(links);
  });
});
