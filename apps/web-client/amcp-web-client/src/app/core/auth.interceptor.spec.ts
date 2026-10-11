import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './services/auth.service';
import { appConfigValues } from './config';

describe('authInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;
  let token: string | null;

  beforeEach(() => {
    token = 'tok-123';
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { getAccessToken: async () => token } },
      ],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
  });

  afterEach(() => ctrl.verify());

  it('attaches the bearer token to gateway requests', async () => {
    http.get(`${appConfigValues.gatewayBaseUrl}/v1/alerts`).subscribe();
    await Promise.resolve();
    const req = ctrl.expectOne(`${appConfigValues.gatewayBaseUrl}/v1/alerts`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok-123');
    req.flush([]);
  });

  it('does not leak the token to third-party URLs', () => {
    http.get('https://example.com/data').subscribe();
    const req = ctrl.expectOne('https://example.com/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('sends the request unauthenticated when there is no session', async () => {
    token = null;
    http.get(`${appConfigValues.gatewayBaseUrl}/v1/models`).subscribe();
    await Promise.resolve();
    const req = ctrl.expectOne(`${appConfigValues.gatewayBaseUrl}/v1/models`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });
});
