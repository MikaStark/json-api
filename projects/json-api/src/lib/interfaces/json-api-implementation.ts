import { JsonApiMeta } from './json-api-meta';

/**
 * ### JSON:API Object
 *
 * A JSON:API document **MAY** include information about its implementation under a
 * top level `jsonapi` member. If present, the value of the `jsonapi` member **MUST**
 * be an object (a “jsonapi object”).
 *
 * The jsonapi object **MAY** contain any of the following members:
 * `version` - whose value is a string indicating the highest JSON:API version supported.
 * `meta` - a [meta](https://jsonapi.org/format/1.1/#document-meta) object that contains non-standard meta-information.
 *
 * If the `version` member is not present, clients should assume the server implements at least version 1.0 of the specification.
 * @example
 * ```json
 * {
 *   "jsonapi": {
 *     "version": "1.1"
 *   }
 * }
 * ```
 * @see https://jsonapi.org/format/1.1/#document-jsonapi-object
 */
export interface JsonApiImplementation {
  /** Whose value is a string indicating the highest JSON:API version supported */
  version?: string;
  /** A [meta](https://jsonapi.org/format/1.1/#document-meta) object that contains non-standard meta-information */
  meta?: JsonApiMeta;
}
