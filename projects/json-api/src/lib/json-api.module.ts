import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JsonApiInterceptorService } from './json-api-interceptor.service';

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
  ) {
    if (parentModule) {
      throw new Error('JsonApiModule is already loaded. Import it in the AppModule only');
    }
  }
}
