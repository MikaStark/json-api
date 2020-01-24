/**
 * ### Meta Information
 *
 * Where specified, a `meta` member can be used to include non-standard meta-information.
 * The value of each meta member **MUST** be an object (a “meta object”).
 *
 * Any members **MAY** be specified within meta objects.
 * @example
 * ```json
 * {
 *   "meta": {
 *     "copyright": "Copyright 2015 Example Corp.",
 *     "authors": [
 *       "Yehuda Katz",
 *       "Steve Klabnik",
 *       "Dan Gebhardt",
 *       "Tyler Kellen"
 *     ]
 *   },
 *   "data": {
 *     // ...
 *   }
 * }
 * ```
 * @see https://jsonapi.org/format/1.1/#document-meta
 */
export type JsonApiMeta = any;
