import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from './services/auth.service';
import { appConfigValues } from './config';

// Adds the Supabase bearer token to gateway requests.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(appConfigValues.gatewayBaseUrl)) {
    return next(req);
  }

  const auth = inject(AuthService);
  return from(auth.getAccessToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }
      return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
    }),
  );
};
