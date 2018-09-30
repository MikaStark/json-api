import { Component } from '@angular/core';
import { AuthorService } from './author.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'api-project';

  constructor(private authors: AuthorService) {
    const newAuthor = this.authors.create();
    newAuthor.attributes.name = 'mika';
    newAuthor.save().subscribe(console.log, console.error);
    this.authors.find('1', {
      include: ['books'],
      fields: {
        author: ['name'],
        books: ['title']
      },
      filter: ['mika', 'stark'],
      sort: ['books.name'],
      page: {
        size: 25,
        number: 1
      }
    }).subscribe(doc => {
      console.log(doc.data.relationships.books.data);
    }, console.error);
  }
}
