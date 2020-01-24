import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { JsonApiParameters } from './interfaces/json-api-parameters';

/** JSON API Http query parameters families builder */
@Injectable({
  providedIn: 'root'
})
export class JsonApiParametersService {
  private appendHttpValueParam(
    httpParams: HttpParams,
    family: string,
    value: string | number | string[] | number[]
  ): HttpParams {
    const stringifiedValue = []
      .concat(value)
      .filter(param => !!param)
      .map(param => param.toString().trim())
      .filter(param => !!param)
      .join(',');

    if (!!stringifiedValue.trim()) {
      return httpParams.append(family, stringifiedValue);
    }
    return httpParams;
  }

  private appendHttpObjectParam(
    httpParams: HttpParams,
    family: string,
    object: { [name: string]: string | number | string[] | number[] }
  ): HttpParams {
    return Object.entries(object)
      .filter(([, value]) => !!value)
      .reduce(
        (params, [key, value]) => this.appendHttpValueParam(params, `${family}[${key}]`, value),
        httpParams
      );
  }

  /**
   * Create Http query params from parameters families
   * @param value Query parameters families to convert into Http query params
   * @example
   * ```typescript
   * // /?single=value
   * this.create({
   *   single: 'value'
   * })
   * ```
   * @example
   * ```typescript
   * // /?multiple=value,other
   * this.create({
   *   multiple: ['value', 'other'],
   * })
   * ```
   * @example
   * ```typescript
   * // /?object[single]=value&object[multiple]=value,other
   * this.create({
   *   object: {
   *     single: 'value',
   *     multiple: ['value', 'other']
   *   }
   * })
   * ```
   * @see https://jsonapi.org/format/1.1/#query-parameters
   */
  create(parameters: JsonApiParameters): HttpParams {
    return Object.entries(parameters || {}).reduce((httpParams, [family, value]) => {
      if (value instanceof Object && !(value instanceof Array)) {
        return this.appendHttpObjectParam(httpParams, family, value);
      }
      if (!!value) {
        return this.appendHttpValueParam(httpParams, family, value);
      }
      return httpParams;
    }, new HttpParams());
  }
}
