import { Injectable, Inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JSON_API_VERSION } from './json-api-version';

@Injectable({
  providedIn: 'root'
})
export class JsonApiInterceptorService implements HttpInterceptor {

  constructor(@Inject(JSON_API_VERSION) private version: string) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        'Content-Type': 'application/vnd.api+json',
        Accept: `application/vnd.${this.version}+json`,
        // tslint:disable-next-line:max-line-length
        Authorization: 'bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9wcC5kZXYtYWxsLWRvY2tlcjEuaW5mcmFkdmUuZnJcL2FwaVwvYXV0aFwvbG9naW4iLCJpYXQiOjE1Mzg0NzU2MzIsImV4cCI6MTUzODU2MjAzMiwibmJmIjoxNTM4NDc1NjMyLCJqdGkiOiJSN0VSZ2UyUmlXeEN4cmZxIiwic3ViIjoidGVzdGF0b20ifQ.4FaGDTiJ922cfpkQRWV9R4e8d9fP25dw5mv2bHRrVu8'
      }
    });
    return next.handle(request);
  }
}
