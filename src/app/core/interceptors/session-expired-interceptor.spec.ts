import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { sessionExpiredInterceptor } from './session-expired-interceptor';

describe('sessionExpiredInterceptor', () => {
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([sessionExpiredInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('does not intercept unauthorized login responses', () => {
    TestBed.inject(HttpTestingController);
    const http = TestBed.inject(HttpClient);

    http.post('/api/auth/login', {}).subscribe({ error: () => undefined });
    const request = httpTesting.expectOne('/api/auth/login');
    request.flush({}, { status: 401, statusText: 'Unauthorized' });

    httpTesting.verify();
  });
});
