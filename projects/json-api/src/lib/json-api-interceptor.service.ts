import { Injectable, Inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JSON_API_VERSION } from './json-api-version';
import { JSON_API_URL } from './json-api-url';

@Injectable({
  providedIn: 'root'
})
export class JsonApiInterceptorService implements HttpInterceptor {

  constructor(
    @Inject(JSON_API_URL) private url: string,
    @Inject(JSON_API_VERSION) private version: string
    ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.startsWith(this.url)) {
      request = request.clone({
        setHeaders: {
          'Content-Type': 'application/vnd.api+json',
          Accept: `application/vnd.${this.version}+json`
        }
      });
    }
    return next.handle(request);
  }
}
