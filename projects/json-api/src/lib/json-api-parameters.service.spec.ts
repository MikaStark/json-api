import { TestBed, inject } from '@angular/core/testing';

import { JsonApiParametersService } from './json-api-parameters.service';
import { HttpParams } from '@angular/common/http';

describe('JsonApiParametersService', () => {
  let params: HttpParams;

  beforeEach(() => TestBed.configureTestingModule({
    providers: [JsonApiParametersService]
  }));

  beforeEach(() => {
    params = new HttpParams;
  }),

  it('should be created', inject([JsonApiParametersService], (service: JsonApiParametersService) => {
    expect(service).toBeTruthy();
  }));

  it('should set include', inject([JsonApiParametersService], (service: JsonApiParametersService) => {
    const include = ['include1', 'include2'];
    expect(params.has('include')).toBeFalsy();
    params = service.httpParams({include});
    expect(params.has('include')).toBeTruthy();
    expect(params.get('include')).toBe(include.join(','));
  }));

  it('should set fields', inject([JsonApiParametersService], (service: JsonApiParametersService) => {
    const fields = {
      entity1: ['field1', 'field2'],
      entity2: ['field3', 'field4'],
    };
    Object.keys(fields).map(key => {
      expect(params.has(`fields[${key}]`)).toBeFalsy();
    });
    params = service.httpParams({fields});
    Object.keys(fields).map(key => {
      expect(params.has(`fields[${key}]`)).toBeTruthy();
      expect(params.get(`fields[${key}]`)).toBe(fields[key].join(','));
    });
  }));

  it('should set filter', inject([JsonApiParametersService], (service: JsonApiParametersService) => {
    const filter = {
      key1: ['value1'],
      key2: ['value2']
    };
    Object.keys(filter).map(key => {
      expect(params.has(`filter[${key}]`)).toBeFalsy();
    });
    params = service.httpParams({filter});
    Object.keys(filter).map(key => {
      expect(params.has(`filter[${key}]`)).toBeTruthy();
      expect(params.get(`filter[${key}]`)).toBe(filter[key].join(','));
    });
  }));

  it('should set page', inject([JsonApiParametersService], (service: JsonApiParametersService) => {
    const page = {
      number: 5,
      size: 25
    };
    Object.keys(page).map(key => {
      expect(params.has(`page[${key}]`)).toBeFalsy();
    });
    params = service.httpParams({page});
    Object.keys(page).map(key => {
      expect(params.has(`page[${key}]`)).toBeTruthy();
      expect(params.get(`page[${key}]`)).toBe(page[key].toString());
    });
  }));

  it('should set sort', inject([JsonApiParametersService], (service: JsonApiParametersService) => {
    const sort = ['sort1', 'sort2'];
    expect(params.has('page')).toBeFalsy();
    params = service.httpParams({sort});
    expect(params.has('sort')).toBeTruthy();
    expect(params.get('sort')).toBe(sort.join(','));
  }));

  it('should set langs', inject([JsonApiParametersService], (service: JsonApiParametersService) => {
    const langs = ['lang1', 'lang2'];
    expect(params.has('page')).toBeFalsy();
    params = service.httpParams({langs});
    expect(params.has('langs')).toBeTruthy();
    expect(params.get('langs')).toBe(langs.join(','));
  }));
});
