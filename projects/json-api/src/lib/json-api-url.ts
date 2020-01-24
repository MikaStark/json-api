import { InjectionToken } from '@angular/core';

/**
 * JSON API url token
 *
 * This token should be provided with a valid url in AppModule
 *
 * @example
 * ```typescript
 * @NgModule({
 *   providers: [
 *     // ...
 *     { provide: JSON_API_URL, useValue: 'http://api.example.com' }
 *   ],
 *   // ...
 * })
 * export class AppModule { }
 * ```
 */
export const JSON_API_URL = new InjectionToken('JSON API url');
