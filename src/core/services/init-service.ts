import { inject, Injectable } from '@angular/core';
import { AccountService } from './account-service';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InitService {
  private accountService = inject(AccountService);

  init() {
    const user = localStorage.getItem('user');
    if (user) {
      this.accountService.currentUser.set(JSON.parse(user));
    }

    return of(null);
  }
}
