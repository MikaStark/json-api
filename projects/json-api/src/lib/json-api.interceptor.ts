import { Injectable, Inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JSON_API_VERSION } from './json-api-version';
import { JSON_API_URL } from './json-api-url';

/**
 * JSON API Http interceptor
 *
 * Intercept all http call sent to the JSON API url and add required headers
 * - **Content-Type** : application/vnd.api+json
 * - **Accept** : application/vnd.XX+json (where *XX* is the api version)
 * @see JSON_API_URL
 * @see JSON_API_VERSION
 */
@Injectable({
  providedIn: 'root'
})
export class JsonApiInterceptor implements HttpInterceptor {
  /**
   * Constructor
   * @param url JSON API url
   * @param version JSON API version
   */
  constructor(
    @Inject(JSON_API_URL) private url: string,
    @Inject(JSON_API_VERSION) private version: string
  ) {}

  /**
   * Intercept JSON API url sent http calls and add mandatory headers
   * @param request Intercepted request
   * @param next Http handler
   */
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
