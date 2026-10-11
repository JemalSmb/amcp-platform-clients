import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

// Redirects to login when there is no session (skipped during SSR).
export const authGuard: CanActivateFn = async () => {
  if (isPlatformServer(inject(PLATFORM_ID))) return true;
  const auth = inject(AuthService);
  const router = inject(Router);
  const session = await auth.getSession();
  return auth.roleOf(session) ? true : router.createUrlTree(['/auth/login']);
};

// Redirects signed-in users away from /auth pages.
export const guestGuard: CanActivateFn = async () => {
  if (isPlatformServer(inject(PLATFORM_ID))) return true;
  const auth = inject(AuthService);
  const router = inject(Router);
  const session = await auth.getSession();
  return auth.roleOf(session) ? router.createUrlTree(['/dashboard']) : true;
};
