import { JsonApiMeta } from './json-api-meta';

/**
 * ### Resource Identifier Objects
 *
 * A “resource identifier object” is an object that identifies an individual resource.
 *
 * A “resource identifier object” **MUST** contain `type` and `id` members.
 *
 * A “resource identifier object” **MAY** also include a `meta` member,
 * whose value is a [meta](https://jsonapi.org/format/1.1/#document-meta) object that contains non-standard meta-information.
 * @see https://jsonapi.org/format/1.1/#document-resource-identifier-objects
 */
export interface JsonApiIdentifierInterface {
  /**
   * Used to describe [resource objects](https://jsonapi.org/format/1.1/#document-resource-objects)
   * that share common attributes and relationships
   */
  type: string;
  /**
   * Within a given API, each resource object’s `type` and `id` pair **MUST** identify a single, unique resource.
   * (The set of URIs controlled by a server, or multiple servers acting as one, constitute an API.)
   *
   * This is not required when the resource object originates at the client and represents a new resource to be created on the server.
   */
  id?: string;
  /** [Meta](https://jsonapi.org/format/1.1/#document-meta) object that contains non-standard meta-information. */
  meta?: JsonApiMeta;
}
