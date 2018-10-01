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
    expect(params.has('fields[entity1]')).toBeFalsy();
    expect(params.has('fields[entity2]')).toBeFalsy();
    params = service.httpParams({fields});
    expect(params.has('fields[entity1]')).toBeTruthy();
    expect(params.has('fields[entity2]')).toBeTruthy();
    expect(params.get('fields[entity1]')).toBe(fields.entity1.join(','));
    expect(params.get('fields[entity2]')).toBe(fields.entity2.join(','));
  }));

  it('should set filter', inject([JsonApiParametersService], (service: JsonApiParametersService) => {
    const filter = ['value1', 'value2'];
    expect(params.has('filter')).toBeFalsy();
    params = service.httpParams({filter});
    expect(params.has('filter')).toBeTruthy();
    expect(params.has('filter')).toBeTruthy();
    expect(params.get('filter')).toBe(filter.join(','));
  }));

  it('should set page', inject([JsonApiParametersService], (service: JsonApiParametersService) => {
    const page = {
      number: 5,
      size: 25
    };
    expect(params.has('page')).toBeFalsy();
    params = service.httpParams({page});
    expect(params.has('page[number]')).toBeTruthy();
    expect(params.get('page[number]')).toBe(page.number.toString());
    expect(params.has('page[size]')).toBeTruthy();
    expect(params.get('page[size]')).toBe(page.size.toString());
  }));

  it('should set sort', inject([JsonApiParametersService], (service: JsonApiParametersService) => {
    const sort = ['sort1', 'sort2'];
    expect(params.has('page')).toBeFalsy();
    params = service.httpParams({sort});
    expect(params.has('sort')).toBeTruthy();
    expect(params.get('sort')).toBe(sort.join(','));
  }));
});
