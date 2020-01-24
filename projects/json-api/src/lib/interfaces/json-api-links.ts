import { JsonApiMeta } from './json-api-meta';

/**
 * ### Links
 *
 * Where specified, a `links` member can be used to represent links.
 * The value of this member **MUST** be an object (a “links object”).
 *
 * Within this object, a link **MUST** be represented as either:
 * * a string containing the link’s URI.
 * * an object (“link object”) which can contain the following members:
 *   * `href`: a string containing the link’s URI.
 *   * `meta`: a meta object containing non-standard meta-information about the link.
 *   * Any link-specific target attributes described below.
 *
 * Except for the `profile` key in the top-level links object and the `type` key in an
 * [error object](https://jsonapi.org/format/1.1/#error-objects)’s links object, each
 * key present in a links object **MUST** have a single link as its value. The
 * aforementioned `profile` and `type` keys, if present, **MUST** hold an array of links.
 *
 * @example
 * ```json
 * "links": {
 *   "self": "http://example.com/articles/1",
 *   "related": {
 *     "href": "http://example.com/articles/1/comments",
 *     "meta": {
 *       "count": 10
 *     }
 *   }
 * }
 * ```
 * @see https://jsonapi.org/format/1.1/#document-links
 */
export interface JsonApiLinks {
  [name: string]:
    | string
    | {
        href: string;
        meta: JsonApiMeta;
      };
}
