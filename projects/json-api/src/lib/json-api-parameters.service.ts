import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Parameters } from './interfaces/parameters';

@Injectable({
  providedIn: 'root'
})
export class JsonApiParametersService {
  private include(params: HttpParams, value: string[]): HttpParams {
    return params.set('include', value.join(','));
  }

  private fields(params: HttpParams, values: {[name: string]: string[]}): HttpParams {
    let newParams = params;
    for (const name in values) {
      if (values[name]) {
        newParams = newParams.set(`fields[${name}]`, values[name].join(','));
      }
    }
    return newParams;
  }

  private sort(params: HttpParams, value: string[]): HttpParams {
    return params.set('sort', value.join(','));
  }

  private page(params: HttpParams, values: {[name: string]: number}): HttpParams {
    let newParams = params;
    for (const name in values) {
      if (values[name]) {
        newParams = newParams.set(`page[${name}]`, values[name].toString());
      }
    }
    return newParams;
  }

  private filter(params: HttpParams, value: string[]): HttpParams {
    return params.set('filter', value.join(','));
  }

  httpParams(value: Parameters) {
    let params = new HttpParams();
    if (!value) {
      return params;
    }
    if (value.include) {
      params = this.include(params, value.include);
    }
    if (value.fields) {
      params = this.fields(params, value.fields);
    }
    if (value.sort) {
      params = this.sort(params, value.sort);
    }
    if (value.page) {
      params = this.page(params, value.page);
    }
    if (value.filter) {
      params = this.filter(params, value.filter);
    }
    return params;
  }
}
