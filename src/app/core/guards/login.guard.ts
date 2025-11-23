import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map } from 'rxjs/operators';

export const loginGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    map((user) => {
      if (user) {
        return router.createUrlTree(['/dashboard']);
      } else {
        return true;
      }
    })
  );
};
