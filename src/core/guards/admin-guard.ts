import { CanActivateFn } from '@angular/router';
import { AccountService } from '../services/account-service';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast-service';

export const adminGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const toastService = inject(ToastService);

  if (
    accountService.currentUser()?.roles?.includes('Admin') ||
    accountService.currentUser()?.roles?.includes('Moderator')
  )
    return true;
  else {
    toastService.error('You must be an admin to access this page');
    return false;
  }
};
