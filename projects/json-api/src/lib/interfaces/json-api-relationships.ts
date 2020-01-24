import { JsonApiIdentifierInterface } from './json-api-identifier-interface';
import { JsonApiLinks } from './json-api-links';
import { JsonApiMeta } from './json-api-meta';

/**
 * ### Relationships
 *
 * The value of the `relationships` key **MUST** be an object (a “relationships object”).
 * Members of the relationships object (“relationships”) represent references from the
 * [resource object](https://jsonapi.org/format/1.1/#document-resource-objects) in which
 * it’s defined to other resource objects.
 *
 * Relationships may be to-one or to-many.
 *
 * A “relationship object” **MUST** contain at least one of the following:
 *
 * * `links`: a links object containing at least one of the following:
 *   * `self`: a link for the relationship itself (a “relationship link”). This link allows
 *     the client to directly manipulate the relationship. For example, removing an `author`
 *     through an `article`’s relationship URL would disconnect the person from the `article`
 *     without deleting the `people` resource itself. When fetched successfully, this link
 *     returns the linkage for the related resources as its primary data. (See
 *     [Fetching Relationships](https://jsonapi.org/format/1.1/#fetching-relationships).)
 *   * related: a [related resource link](https://jsonapi.org/format/1.1/#document-resource-object-related-resource-links)
 * * `data`: [resource linkage](https://jsonapi.org/format/1.1/#document-resource-object-linkage)
 * * `meta`: a [meta object](https://jsonapi.org/format/1.1/#document-meta) that contains
 * non-standard meta-information about the relationship.
 *
 * A relationship object that represents a to-many relationship **MAY** also contain
 * [pagination](https://jsonapi.org/format/1.1/#fetching-pagination) links under the
 * `links` member, as described below. Any [pagination](https://jsonapi.org/format/1.1/#fetching-pagination)
 * links in a relationship object **MUST** paginate the relationship data, not the related resources.
 * @see https://jsonapi.org/format/1.1/#document-resource-object-relationships
 */
export interface JsonApiRelationships<T = JsonApiIdentifierInterface> {
  [name: string]: {
    /** A links object */
    links?: JsonApiLinks;
    /** A [resource linkage](https://jsonapi.org/format/1.1/#document-resource-object-linkage) */
    data?: T | T[];
    /**
     * a [meta object](https://jsonapi.org/format/1.1/#document-meta) that contains
     * non-standard meta-information about the relationship.
     */
    meta?: JsonApiMeta;
  };
}
