import { Component, Injectable } from '@angular/core';
import { Resource, DocumentCollection, Service, DocumentResource } from 'json-api';
import { mergeMap } from 'rxjs/operators';

class Currency extends Resource {
  attributes: {
    label: {[locale: string]: string}
  };

  relationships: {
    country: DocumentResource<Country>
  };
}

class Country extends Resource {
  relationships: {
    currencies: DocumentCollection<Currency>
  };
}

@Injectable({
  providedIn: 'root'
})
class CountriesService extends Service<Country> {
  type = 'countries';
  resource = Country;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'api-project';
  constructor(countries: CountriesService) {
    countries.all({ include: ['currencies', 'taxes', 'taxes.taxescategory'] }).subscribe(console.log);
    countries.find('FR', { include: ['currencies', 'taxes', 'taxes.taxescategory'] }).subscribe(console.log);
    countries.find('FR', { include: ['currencies'] }).pipe(
      mergeMap(doc => doc.data.getRelationships('taxes', { include: ['taxescategory'] }))
    ).subscribe(console.log);
  }
}
