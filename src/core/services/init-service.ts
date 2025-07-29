import { inject, Injectable } from '@angular/core';
import { AccountService } from './account-service';
import { Observable, of } from 'rxjs';
import { FriendsService } from './friends-service';

@Injectable({
  providedIn: 'root'
})
export class InitService {
  private accountService = inject(AccountService);
  private friendService = inject(FriendsService);

  init(): Observable<null> {
    const user = localStorage.getItem('user');
    if (user) {
      this.accountService.currentUser.set(JSON.parse(user));
    }

    this.friendService.getFriendRequestIds();

    return of(null);
  }
}
