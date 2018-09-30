import { Resource, DocumentCollection } from 'json-api';
import { Book } from './book';

export class Author extends Resource {
  attributes = {
    name: ''
  };
  relationships = {
    books: new DocumentCollection<Book>()
  };
}
