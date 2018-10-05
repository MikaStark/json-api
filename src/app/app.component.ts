import { Component, Injectable, OnInit } from '@angular/core';
import { Resource, Service, Relationships, Relationship, JsonApiRegisterService, JsonApiFactoryService } from 'json-api';
import { mergeMap, tap } from 'rxjs/operators';

class Country extends Resource {
  attributes: {
    name?: {[locale: string]: string}
  };
  relationships: {
    currencies: Relationships<Currency>,
    taxes: Relationships<Tax>
  };
}

class Currency extends Resource {
  attributes: {
    label: {[locale: string]: string}
  };

  relationships: {
    country: Relationship<Country>
  };
}

class Tax extends Resource {
  attributes: {
    label: {[locale: string]: string};
    validity: string;
  };
  relationships: {
    taxescategory: Relationship<TaxesCategory>;
    country: Relationship<Country>;
  };
}

class TaxesCategory extends Resource {
  attributes: {
    label: {[locale: string]: string}
  };
}

class Firm extends Resource {
  relationships: {
    parentfirm: Relationship<Firm>
  };
}

@Injectable({
  providedIn: 'root',
  useFactory: (factory: JsonApiFactoryService) => factory.service('countries', Country),
  deps: [JsonApiFactoryService]
})
class CountriesService extends Service<Country> { }

@Injectable({
  providedIn: 'root',
  useFactory: (factory: JsonApiFactoryService) => factory.service('firms', Firm),
  deps: [JsonApiFactoryService]
})
class FirmsServices extends Service<Firm> { }

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'api-project';

  constructor(
    private countries: CountriesService,
    private firms: FirmsServices,
    register: JsonApiRegisterService
  ) {
    register.setMany({
      firms: Firm,
      countries: Country,
      taxes: Tax,
      taxes_categories: TaxesCategory,
      currencies: Currency
    });
  }

  ngOnInit() {
    this.countries.all({
      include: ['currencies', 'taxes', 'taxes.taxescategory']
    }).subscribe(console.log);
    this.countries.find('FR', {
      include: ['currencies', 'taxes', 'taxes.taxescategory']
    }).subscribe(console.log);
    this.countries.find('FR', {
      include: ['currencies'] }).pipe(
      tap(console.log),
      mergeMap(doc => doc.data.getRelationships('currencies'))
    ).subscribe(console.log);
  }
}
