import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonApiParametersService } from './json-api-parameters.service';
import { JSON_API_URL } from './json-api-url';
import { JsonApiBuilderService } from './json-api-builder.service';

@Injectable({
  providedIn: 'root'
})
export class JsonApiService {

  static url: string = null;
  static http: HttpClient = null;
  static params: JsonApiParametersService = null;
  static builder: JsonApiBuilderService = null;

  constructor(
    @Inject(JSON_API_URL) url: string,
    http: HttpClient,
    params: JsonApiParametersService,
    builder: JsonApiBuilderService
  ) {
    JsonApiService.url = url;
    JsonApiService.http = http;
    JsonApiService.params = params;
    JsonApiService.builder = builder;
  }
}
