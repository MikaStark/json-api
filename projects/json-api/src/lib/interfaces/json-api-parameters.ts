/**
 * ### Query Parameters
 *
 * #### Query Parameter Families
 *
 * Although “query parameter” is a common term in everyday web development, it is not
 * a well-standardized concept. Therefore, JSON:API provides its own
 * [definition of a query parameter](https://jsonapi.org/format/1.1/#appendix-query-details).
 *
 * For the most part, JSON:API’s definition coincides with colloquial usage, and its details
 * can be safely ignored. However, one important consequence of this definition is that a URL
 * like the following is considered to have two distinct query parameters:
 *
 * ```
 * /?page[offset]=0&page[limit]=10
 * ```
 *
 * The two parameters are named `page[offset]` and `page[limit]`; there is no single page parameter.
 *
 * In practice, however, parameters like `page[offset]` and `page[limit]` are usually defined and
 * processed together, and it’s convenient to refer to them collectively. Therefore, JSON:API
 * introduces the concept of a query parameter family.
 *
 * A “query parameter family” is the set of all query parameters whose name starts with a “base name”,
 * followed by zero or more instances of empty square brackets (i.e. `[]`) or square-bracketed legal
 * member names. The family is referred to by its base name.
 *
 * For example, the filter query parameter family includes parameters named: `filter`, `filter[x]`,
 * `filter[]`, `filter[x][]`, `filter[][]`, `filter[x][y]`, etc. However, `filter[_]` is not a valid
 * parameter name in the family, because `_` is not a valid
 * [member name](https://jsonapi.org/format/1.1/#document-member-names).
 *
 * #### Implementation-Specific Query Parameters
 *
 * Implementations **MAY** support custom query parameters. However, the names of these query parameters
 * **MUST** come from a family whose base name is a legal member name and also contains at least one non
 * a-z character (i.e., outside U+0061 to U+007A).
 *
 * It is **RECOMMENDED** that a capital letter (e.g. camelCasing) be used to satisfy the above requirement.
 *
 * If a server encounters a query parameter that does not follow the naming conventions above, and the server
 * does not know how to process it as a query parameter from this specification, it **MUST** return
 * `400 Bad Request`.
 * @see https://jsonapi.org/format/1.1/#fetching-includes
 * @see https://jsonapi.org/format/1.1/#fetching-sparse-fieldsets
 * @see https://jsonapi.org/format/1.1/#fetching-sorting
 * @see https://jsonapi.org/format/1.1/#fetching-filtering
 * @see https://jsonapi.org/format/1.1/#fetching-pagination
 * @see https://jsonapi.org/format/1.1/#query-parameters
 */
export interface JsonApiParameters {
  [name: string]: any;
}
