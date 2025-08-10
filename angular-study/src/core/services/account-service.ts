import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { RegisterCreds, User } from '../../types/user';
import { catchError, Observable, of, take, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { FriendsService } from './friends-service';
import { emptyCache } from '../interceptors/loading-interceptor';
import { PresenceService } from './presence-service';
import { HubConnectionState } from '@microsoft/signalr';
import { MessageService } from './message-service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);
  private friendService = inject(FriendsService);
  private presenceService = inject(PresenceService);
  currentUser = signal<User | null>(null);
  private baseUrl = `${environment.apiUrl}/account`;
  private refreshTokenTimer: number | null = null;

  register(creds: RegisterCreds): Observable<User> {
    return this.http
      .post<User>(this.baseUrl + '/register', creds, { withCredentials: true })
      .pipe(
        tap((userData) => {
          if (userData) {
            this.setCurrentUser(userData);
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
          }
        })
      );
  }

  refreshToken() {
    return this.http.post<User>(`${this.baseUrl}/refresh-token`, {},
      { withCredentials: true }
    ).pipe(
      take(1),
      catchError(error => {
        if (error.status === 401) {
          this.logout();
          return of(null);
        }

        return of(error);
      })
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
    }, 13 * 60 * 1000);
  }

  setCurrentUser(user: User): void {
    user.roles = this.getRolesFromToken(user);
    this.currentUser.set(user);
    this.friendService.getFriendRequestIds();
    this.friendService.getFriendIds();

    if (this.refreshTokenTimer == null) {
      this.startTokenRefreshInterval();
    }

    if (this.presenceService.hubConnection?.state !== HubConnectionState.Connected) {
      this.presenceService.createHubConnection(user);
    }
  }

  logout(): void {
    this.http
      .post(`${this.baseUrl}/logout`, {}, { withCredentials: true })
      .pipe(take(1))
      .subscribe({
        next: () => {
          localStorage.removeItem('filters');
          this.currentUser.set(null);
      
          if (this.refreshTokenTimer) {
            clearInterval(this.refreshTokenTimer);
            this.refreshTokenTimer = null;
          }
      
          this.friendService.clearRequestIds();
          this.presenceService.stopHubConnection();
          emptyCache();
        }
      });

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
