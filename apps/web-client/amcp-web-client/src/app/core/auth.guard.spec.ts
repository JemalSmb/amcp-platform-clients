import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from './services/auth.service';

function setup(session: unknown, platform = 'browser') {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: PLATFORM_ID, useValue: platform },
      { provide: AuthService, useValue: { getSession: async () => session } },
    ],
  });
}

const run = (guard: typeof authGuard) =>
  TestBed.runInInjectionContext(() => guard({} as never, {} as never)) as Promise<boolean | UrlTree>;

describe('route guards', () => {
  it('authGuard redirects anonymous users to /auth/login', async () => {
    setup(null);
    const out = (await run(authGuard)) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(out)).toBe('/auth/login');
  });

  it('authGuard allows signed-in users', async () => {
    setup({ user: 'u' });
    expect(await run(authGuard)).toBe(true);
  });

  it('authGuard skips the check during SSR', async () => {
    setup(null, 'server');
    expect(await run(authGuard)).toBe(true);
  });

  it('guestGuard sends signed-in users to /dashboard', async () => {
    setup({ user: 'u' });
    const out = (await run(guestGuard)) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(out)).toBe('/dashboard');
  });

  it('guestGuard allows anonymous users', async () => {
    setup(null);
    expect(await run(guestGuard)).toBe(true);
  });
});
