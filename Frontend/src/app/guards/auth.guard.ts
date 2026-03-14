import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {StorageService} from '../storage.service';

export const authGuard: CanActivateFn = () => {
  const storage = inject(StorageService);
  const router  = inject(Router);

  if (storage.getToken()) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const storage = inject(StorageService);
  const router  = inject(Router);

  if (!storage.getToken()) {
    return true;
  }

  // Already logged in — redirect to dashboard
  router.navigate(['/user/dashboard']);
  return false;
};
