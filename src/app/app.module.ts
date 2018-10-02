import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { JsonApiModule, JSON_API_URL } from 'json-api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    JsonApiModule
  ],
  providers: [
    {
      provide: JSON_API_URL,
      useValue: 'http://pp.dev-all-docker1.infradve.fr/api'
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
