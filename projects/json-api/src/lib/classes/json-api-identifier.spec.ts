import { Identifier } from '../decorators/identifier';
import { JsonApiIdentifier } from './json-api-identifier';

@Identifier({
  type: 'foos',
})
class FooIdentifier extends JsonApiIdentifier {}

describe('JsonApiIdentifier', () => {
  it('should create an instance with an ID and metas', () => {
    const identifier = new FooIdentifier({
      id: '1',
      meta: {
        foo: 'fake',
      },
    });
    expect(identifier.id).toBe('1');
    expect(identifier.type).toBe('foos');
    expect(identifier.meta).toEqual({
      foo: 'fake',
    });
  });

  it('should set metas', () => {
    const identifier = new FooIdentifier();
    expect(identifier.meta).toBeUndefined();
    identifier.meta = {
      foo: 'fake',
    };
    expect(identifier.meta).toEqual({
      foo: 'fake',
    });
  });
});
