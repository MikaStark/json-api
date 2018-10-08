import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonApiParametersService } from './json-api-parameters.service';
import { JsonApiFactoryService } from './json-api-factory.service';
import { JSON_API_URL } from './json-api-url';

@Injectable()
export class JsonApiService {

  static url: string = null;
  static http: HttpClient = null;
  static params: JsonApiParametersService = null;
  static factory: JsonApiFactoryService = null;

  constructor(
    @Inject(JSON_API_URL) url: string,
    http: HttpClient,
    params: JsonApiParametersService,
    factory: JsonApiFactoryService
  ) {
    JsonApiService.url = url;
    JsonApiService.http = http;
    JsonApiService.params = params;
    JsonApiService.factory = factory;
  }
}
