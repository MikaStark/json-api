import { JsonApiIdentifierInterface } from './json-api-identifier-interface';
import { JsonApiLinks } from './json-api-links';
import { JsonApiAttributes } from './json-api-attributes';
import { JsonApiRelationships } from './json-api-relationships';

/**
 * ### Resource Objects
 *
 * “Resource objects” appear in a JSON:API document to represent resources.
 *
 * A resource object MUST contain at least the following top-level members:
 * * `id`
 * * `type`
 *
 * Exception: The `id` member is not required when the resource object originates
 * at the client and represents a new resource to be created on the server.
 *
 * In addition, a resource object **MAY** contain any of these top-level members:
 * * `attributes`: an [attributes object](https://jsonapi.org/format/1.1/#document-resource-object-attributes)
 * representing some of the resource’s data.
 * * `relationships`: a [relationships object](https://jsonapi.org/format/1.1/#document-resource-object-relationships)
 * describing relationships between the resource and other JSON:API resources.
 * * `links`: a [links object](https://jsonapi.org/format/1.1/#document-links)
 * containing links related to the resource.
 * * `meta`: a [meta object](https://jsonapi.org/format/1.1/#document-meta)
 * containing non-standard meta-information about a resource that can not be
 * represented as an attribute or relationship.
 *
 * @example
 * ```json
 * // ...
 * {
 *   "type": "articles",
 *   "id": "1",
 *   "attributes": {
 *     "title": "Rails is Omakase"
 *   },
 *   "relationships": {
 *     "author": {
 *       "links": {
 *         "self": "/articles/1/relationships/author",
 *         "related": "/articles/1/author"
 *       },
 *       "data": { "type": "people", "id": "9" }
 *     }
 *   }
 * }
 * // ...
 * ```
 * @see https://jsonapi.org/format/1.1/#document-resource-objects
 */
export interface JsonApiResourceInterface extends JsonApiIdentifierInterface {
  /**
   * An [attributes object](https://jsonapi.org/format/1.1/#document-resource-object-attributes)
   * representing some of the resource’s data
   */
  attributes?: JsonApiAttributes;
  /**
   * A [relationships object](https://jsonapi.org/format/1.1/#document-resource-object-relationships)
   * describing relationships between the resource and other JSON:API resources.
   */
  relationships?: JsonApiRelationships;
  /**
   * a [links object](https://jsonapi.org/format/1.1/#document-links)
   * containing links related to the resource.
   */
  links?: JsonApiLinks;
}
