import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        // tslint:disable-next-line:max-line-length
        Authorization: 'bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9wcC5kZXYtYWxsLWRvY2tlcjEuaW5mcmFkdmUuZnJcL2FwaVwvYXV0aFwvbG9naW4iLCJpYXQiOjE1Mzg2NDg5MzEsImV4cCI6MTUzODczNTMzMSwibmJmIjoxNTM4NjQ4OTMxLCJqdGkiOiJtZWpFVm45ajBrNTdPY3Q1Iiwic3ViIjoidGVzdGF0b20ifQ.R3aHR8ifsJaB4V9mwP5Lkoo8t3-Pyj9LVtNXcTdTFPg'
      }
    });
    return next.handle(request);
  }
}
