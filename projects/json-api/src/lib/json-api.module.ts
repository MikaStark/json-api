import { NgModule, Optional, SkipSelf, Inject } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { JsonApiInterceptorService } from './json-api-interceptor.service';
import { JSON_API_URL } from './json-api-url';
import { JsonApiParametersService } from './json-api-parameters.service';
import { JsonApiRegisterService } from './json-api-register.service';

@NgModule({
  imports: [HttpClientModule],
  exports: [HttpClientModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JsonApiInterceptorService,
      multi: true
    }
  ]
})
export class JsonApiModule {
  static url: string = null;
  static http: HttpClient = null;
  static params: JsonApiParametersService = null;
  static register: JsonApiRegisterService = null;

  constructor(
    @Optional() @SkipSelf() parentModule: JsonApiModule,
    @Inject(JSON_API_URL) url: string,
    http: HttpClient,
    params: JsonApiParametersService,
    register: JsonApiRegisterService
  ) {
    if (parentModule) {
      throw new Error('JsonApiModule is already loaded. Import it in the AppModule only');
    }
    JsonApiModule.url = url;
    JsonApiModule.http = http;
    JsonApiModule.params = params;
    JsonApiModule.register = register;
  }
}
