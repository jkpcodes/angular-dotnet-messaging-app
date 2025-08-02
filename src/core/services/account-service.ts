import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { RegisterCreds, User } from '../../types/user';
import { Observable, take, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { FriendsService } from './friends-service';
import { emptyCache } from '../interceptors/loading-interceptor';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);
  private friendService = inject(FriendsService);
  currentUser = signal<User | null>(null);
  private baseUrl = `${environment.apiUrl}/account`;
  private refreshTokenTimer?: number;

  register(creds: RegisterCreds): Observable<User> {
    return this.http
      .post<User>(this.baseUrl + '/register', creds, { withCredentials: true })
      .pipe(
        tap((userData) => {
          if (userData) {
            this.setCurrentUser(userData);
            this.startTokenRefreshInterval();
          }
        })
      );
  }

  login(creds: any): Observable<User> {
    return this.http
      .post<User>(this.baseUrl + '/login', creds, { withCredentials: true })
      .pipe(
        tap((userData) => {
          if (userData) {
            this.setCurrentUser(userData);
            this.startTokenRefreshInterval();
          }
        })
      );
  }

  refreshToken() {
    return this.http.post<User>(`${this.baseUrl}/refresh-token`, {},
      { withCredentials: true }
    );
  }

  startTokenRefreshInterval() {
    this.refreshTokenTimer = setInterval(() => {
      this.http.post<User>(`${this.baseUrl}/refresh-token`, {},
        { withCredentials: true }
      )
        .pipe(take(1))
        .subscribe({
          next: (user) => {
            this.setCurrentUser(user);
          },
          error: () => {
            this.logout();
          }
        });
    }, 5 * 60 * 1000);
  }

  setCurrentUser(user: User): void {
    user.roles = this.getRolesFromToken(user);
    this.currentUser.set(user);
    this.friendService.getFriendRequestIds();
  }

  logout(): void {
    localStorage.removeItem('filters');
    this.currentUser.set(null);
    clearInterval(this.refreshTokenTimer);
    this.friendService.clearRequestIds();
    emptyCache();
  }

  private getRolesFromToken(user: User): string[] {
    const payload = user.token.split('.')[1];
    const decoded = atob(payload);
    const jsonPayload = JSON.parse(decoded);

    return Array.isArray(jsonPayload.role)
      ? jsonPayload.role
      : [jsonPayload.role];
  }
}
