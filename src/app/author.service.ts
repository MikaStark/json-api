import { Injectable } from '@angular/core';
import { Service } from 'json-api';
import { Author } from './author';

@Injectable({
  providedIn: 'root'
})
export class AuthorService extends Service<Author> {
  type = 'authors';
  resource = Author;
}
