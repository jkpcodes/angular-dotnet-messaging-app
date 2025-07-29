import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { RegisterCreds, User } from '../../types/user';
import { first, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { FriendsService } from './friends-service';
import { emptyCache } from '../interceptors/loading-interceptor';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private friendService = inject(FriendsService);
  currentUser = signal<User | null>(null);
  private baseUrl = `${environment.apiUrl}/account`;

  register(creds: RegisterCreds): Observable<User> {
    return this.http.post<User>(this.baseUrl + '/register', creds).pipe(
      tap((userData) => {
        if (userData) {
          this.setCurrentUser(userData);
        }
      })
    );
  }

  login(creds: any): Observable<User> {
    return this.http.post<User>(this.baseUrl + '/login', creds).pipe(
      tap((userData) => {
        if (userData) {
          this.setCurrentUser(userData);
        }
      })
    );
  }

  setCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
    this.friendService.getFriendRequestIds();
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('filters');
    this.currentUser.set(null);
    this.friendService.clearRequestIds();
    emptyCache();
  }
}
