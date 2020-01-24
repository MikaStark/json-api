import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JsonApiInterceptor } from './json-api.interceptor';

/**
 * JSON API main module
 *
 * This module import/export HttpClient and provide an interceptor providing mandatory headers
 *
 * It should be imported only one time in AppModule with at least a provider for JSON_API_URL token
 *
 * @see https://jsonapi.org/format/#content-negotiation-clients
 * @example
 * ```typescript
 * @NgModule({
 *   imports: [
 *     // ...
 *     JsonApiModule
 *   ],
 *   providers: [
 *     // ...
 *     { provide: JSON_API_URL, useValue: 'http://my.api.com' }
 *     // optional
 *     { provide: JSON_API_VERSION, useValue: 'v0' }
 *   ],
 *   // ...
 * })
 * export class AppModule { }
 * ```
 */
@NgModule({
  imports: [HttpClientModule],
  exports: [HttpClientModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JsonApiInterceptor,
      multi: true
    }
  ]
})
export class JsonApiModule {
  /**
   * Constructor
   * @param parentModule eventual parent module (should not exist)
   */
  constructor(@Optional() @SkipSelf() parentModule: JsonApiModule) {
    if (parentModule) {
      throw new Error('JsonApiModule is already loaded. Import it in the AppModule only');
    }
  }
}
