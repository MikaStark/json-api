import { NgModule, Optional, SkipSelf, ModuleWithProviders } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JsonApiInterceptorService } from './json-api-interceptor.service';
import { JsonApiService } from './json-api.service';

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
  constructor(
    @Optional() @SkipSelf() parentModule: JsonApiModule,
    _: JsonApiService
  ) {
    if (parentModule) {
      throw new Error('JsonApiModule is already loaded. Import it in the AppModule only');
    }
  }
}
