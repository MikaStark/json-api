import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Parameters } from './interfaces/parameters';
import { isArray } from 'util';

@Injectable({
  providedIn: 'root'
})
export class JsonApiParametersService {
  private listCollection(params: HttpParams, name: string, values: {[name: string]: any|any[]}): HttpParams {
    let newParams = params;
    for (const key in values) {
      if (isArray(values[key])) {
        const list = values[key];
        if (list.length > 0) {
          newParams = newParams.set(`${name}[${key}]`, list.join(','));
        }
      } else {
        const value = values[key];
        if (value) {
          newParams = newParams.set(`${name}[${key}]`, value.toString());
        }
      }
    }
    return newParams;
  }

  private collection(params: HttpParams, name: string, values: {[name: string]: string|number}): HttpParams {
    let newParams = params;
    for (const key in values) {
      if (values[key]) {
        newParams = newParams.set(`${name}[${key}]`, values[key].toString());
      }
    }
    return newParams;
  }

  private list(params: HttpParams, name: string, value: string[]): HttpParams {
    return params.set(name, value.join(','));
  }

  httpParams(value: Parameters) {
    let params = new HttpParams();
    if (!value) {
      return params;
    }
    if (value.langs) {
      params = this.list(params, 'langs', value.langs);
    }
    if (value.include) {
      params = this.list(params, 'include', value.include);
    }
    if (value.fields) {
      params = this.listCollection(params, 'fields', value.fields);
    }
    if (value.sort) {
      params = this.list(params, 'sort', value.sort);
    }
    if (value.page) {
      params = this.collection(params, 'page', value.page);
    }
    if (value.filter) {
      params = this.listCollection(params, 'filter', value.filter);
    }
    return params;
  }
}
