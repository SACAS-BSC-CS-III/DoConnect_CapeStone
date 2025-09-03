import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const loggedIn = auth.isLoggedIn();
  const role = auth.getUserRole();
  const adminOnly = route.data?.['admin'] === true;

  console.log('Guard Debug:', { loggedIn, role, adminOnly, route: state.url });

  if (!loggedIn) {
    console.warn('Not logged in → redirecting to login');
    router.navigate(['/login']);
    return false;
  }

  if (adminOnly && role !== 'Admin') {
    console.warn('Not admin → redirecting to questions');
    router.navigate(['/questions']);
    return false;
  }

  return true;
};
