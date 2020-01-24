import { JsonApiParametersService } from './json-api-parameters.service';
import { TestBed } from '@angular/core/testing';
import { HttpParams } from '@angular/common/http';

const parameters = {
  single: 'value',
  multiple: ['value', 'other'],
  object: {
    single: 'value',
    multiple: ['value', 'other']
  }
};

describe('JsonApiParametersService', () => {
  let service: JsonApiParametersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(JsonApiParametersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create HttpParams', () => {
    const params = service.create({});
    expect(params).toEqual(jasmine.any(HttpParams));
  });

  it('should set nothing wihout params', () => {
    const nullParams = service.create(null);
    expect(nullParams.keys().length).toEqual(0);
    const undefinedParams = service.create(undefined);
    expect(undefinedParams.keys().length).toEqual(0);
  });

  it('should set single value params', () => {
    const params = service.create(parameters);
    expect(params.get('single')).toBe(parameters.single);
  });

  it('should set array params', () => {
    const params = service.create(parameters);
    expect(params.get('multiple')).toBe(parameters.multiple.join(','));
  });

  it('should set single value collection params', () => {
    const params = service.create(parameters);
    expect(params.get('object[single]')).toBe(parameters.object.single);
  });

  it('should set array collection params', () => {
    const params = service.create(parameters);
    expect(params.get('object[multiple]')).toBe(parameters.object.multiple.join(','));
  });
});
