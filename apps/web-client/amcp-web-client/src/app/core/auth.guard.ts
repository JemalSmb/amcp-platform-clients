import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

// Redirects to login when there is no session (skipped during SSR).
export const authGuard: CanActivateFn = async () => {
  if (isPlatformServer(inject(PLATFORM_ID))) return true;
  const session = await inject(AuthService).getSession();
  return session ? true : inject(Router).createUrlTree(['/auth/login']);
};

// Redirects signed-in users away from /auth pages.
export const guestGuard: CanActivateFn = async () => {
  if (isPlatformServer(inject(PLATFORM_ID))) return true;
  const session = await inject(AuthService).getSession();
  return session ? inject(Router).createUrlTree(['/dashboard']) : true;
};
