import { JsonApiMeta } from './json-api-meta';
import { JsonApiLinks } from './json-api-links';

/**
 * ### Error Objects
 *
 * Error objects provide additional information about problems encountered while performing an operation.
 * Error objects **MUST** be returned as an array keyed by `errors` in the top level of a JSON:API document.
 * @see https://jsonapi.org/format/1.1/#errors
 */
export class JsonApiError {
  /** A unique identifier for this particular occurrence of the problem */
  id?: string;
  /** A [links object](https://jsonapi.org/format/1.1/#document-links)  */
  links?: JsonApiLinks;
  /** The HTTP status code applicable to this problem, expressed as a string value */
  status?: string;
  /** An application-specific error code, expressed as a string value */
  code?: string;
  /**
   * A short, human-readable summary of the problem that **SHOULD NOT**
   * change from occurrence to occurrence of the problem, except for purposes of localization
   */
  title?: string;
  /** A human-readable explanation specific to this occurrence of the problem. Like `title`, this field’s value can be localized */
  detail?: string;
  /** An object containing references to the source of the error */
  source?: {
    /**
     * a JSON Pointer [RFC6901](https://tools.ietf.org/html/rfc6901) to the value in the request
     * document that caused the error [e.g. `"/data"` for a primary data object, or `"/data/attributes/title"`
     * for a specific attribute]. This **MUST** point to a value in the request document
     * that exists; if it doesn’t, the client **SHOULD** simply ignore the pointer
     */
    pointer?: string;
    /** A string indicating which URI query parameter caused the error */
    parameter?: string;
  };
  /** A [meta object](https://jsonapi.org/format/1.1/#document-meta) containing non-standard meta-information about the error */
  meta?: JsonApiMeta;
}
