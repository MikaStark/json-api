import { Component, Injectable } from '@angular/core';
import { Resource, DocumentCollection, Service, DocumentResource } from 'json-api';

class Currency extends Resource {
  attributes: {
    label: {[locale: string]: string}
  };

  relationships = {
    country: new DocumentResource<Country>()
  };

  replaceLabel(label: string): void {
    this.attributes.label['en-US'] = label;
  }
}

class Country extends Resource {
  relationships = {
    currencies: new DocumentCollection<Currency>()
  };
}

@Injectable({
  providedIn: 'root'
})
class CountriesService extends Service<Country> {
  type = 'countries';
  resource = Country;
  relationships = {
    currencies: Currency
  };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'api-project';
  constructor(countries: CountriesService) {
    countries.all({ include: ['currencies'] }).subscribe(doc => {
      doc.data[0].relationships.currencies.data[0].replaceLabel('azer');
      doc.included[1].attributes.label['en-US'] = 'qsdf';
      console.log(doc);
    });
  }
}
