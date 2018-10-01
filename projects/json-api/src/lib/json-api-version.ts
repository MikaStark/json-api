import { InjectionToken } from '@angular/core';

export const JSON_API_VERSION = new InjectionToken<string>('API Version for content-type header', {
  providedIn: 'root',
  factory: () => 'api'
});
