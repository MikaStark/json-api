import { JsonApiMeta } from './json-api-meta';
import { JsonApiLinks } from '.';
import { JsonApiImplementation } from './json-api-implementation';
import { JsonApiError } from './json-api-error';
import { JsonApiResourceInterface } from './json-api-resource-interface';
import { JsonApiIdentifierInterface } from './json-api-identifier-interface';

/**
 * ### Top Level
 *
 * A JSON object **MUST** be at the root of every JSON:API request and response containing data. This
 * object defines a document’s “top level”.
 *
 * A document **MUST** contain at least one of the following top-level members:
 * * `data`: the document’s “primary data”
 * * `errors`: an array of [error objects](https://jsonapi.org/format/1.1/#errors)
 * * `meta`: a [meta object](https://jsonapi.org/format/1.1/#document-meta) that contains non-standard meta-information.
 *
 * The members `data` and `errors` **MUST NOT** coexist in the same document.
 *
 * A document **MAY** contain any of these top-level members:
 *
 * A document MAY contain any of these top-level members:
 * * `jsonapi`: an object describing the server’s implementation
 * * `links`: a [links object](https://jsonapi.org/format/1.1/#document-links) related to the primary data.
 * * `included`: an array of [resource objects](https://jsonapi.org/format/1.1/#document-resource-objects)
 * that are related to the primary data and/or each other (“included resources”).
 *
 * If a document does not contain a top-level `data` key, the `included` member **MUST NOT** be present either.
 *
 * The top-level [links object](https://jsonapi.org/format/1.1/#document-links) MAY contain the following members:
 * * `self`: the [link](https://jsonapi.org/format/1.1/#document-links) that generated the current response document.
 * * `related`: a [related resource link](https://jsonapi.org/format/1.1/#document-resource-object-related-resource-links)
 * when the primary data represents a resource relationship.
 * * `profile`: an array of [links](https://jsonapi.org/format/1.1/#document-links-link), each specifying a
 * [profile](https://jsonapi.org/format/1.1/#profiles)in use in the document.
 * * [pagination](https://jsonapi.org/format/1.1/#fetching-pagination) links for the primary data.
 *
 * The document’s “primary data” is a representation of the resource or collection of resources targeted by a request.
 *
 * Primary data **MUST** be either:
 * * a single [resource object](https://jsonapi.org/format/1.1/#document-resource-objects),
 * a single [resource identifier object](https://jsonapi.org/format/1.1/#document-resource-identifier-objects),
 * or `null`, for requests that target single resources
 * * an array of [resource objects](https://jsonapi.org/format/1.1/#document-resource-objects),
 * an array of resource identifier objects, or an empty array (`[]`), for requests that target resource collections
 * @example
 * ```json
 * {
 *  "data": {
 *    "type": "articles",
 *    "id": "1",
 *    "attributes": {
 *      // ... this article's attributes
 *    },
 *    "relationships": {
 *      // ... this article's relationships
 *    }
 *  }
 * }
 * ```
 * @example
 * ```json
 * {
 *   "data": {
 *     "type": "articles",
 *     "id": "1"
 *   }
 * }
 * ```
 * @see https://jsonapi.org/format/1.1/#document-top-level
 */
export interface JsonApiDocument<
  T extends
    | JsonApiResourceInterface
    | JsonApiResourceInterface[]
    | JsonApiIdentifierInterface
    | JsonApiIdentifierInterface[] =
    | JsonApiResourceInterface
    | JsonApiResourceInterface[]
    | JsonApiIdentifierInterface
    | JsonApiIdentifierInterface[]
> {
  /** The document’s “primary data” */
  data?: T;
  /** An array of [error objects](https://jsonapi.org/format/1.1/#errors) */
  errors?: JsonApiError[];
  /** A [meta object](https://jsonapi.org/format/1.1/#document-meta) that contains non-standard meta-information */
  meta?: JsonApiMeta;
  /**
   * An array of [resource objects](https://jsonapi.org/format/1.1/#document-resource-objects)
   * that are related to the primary data and/or each other (“included resources”).
   */
  included?: JsonApiResourceInterface[];
  /** A [links object](https://jsonapi.org/format/1.1/#document-links) related to the primary data */
  links?: JsonApiLinks;
  /** An object describing the server’s implementation */
  jsonapi?: JsonApiImplementation;
}
