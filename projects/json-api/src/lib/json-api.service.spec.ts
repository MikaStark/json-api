import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { JsonApiService } from './json-api.service';
import { JSON_API_URL } from './json-api-url';

describe('JsonApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [
      JsonApiService,
      {
        provide: JSON_API_URL,
        useValue: 'http://fake.url.com'
      }
    ]
  }));

  it('should be created', () => {
    const service: JsonApiService = TestBed.get(JsonApiService);
    expect(service).toBeTruthy();
  });
});
