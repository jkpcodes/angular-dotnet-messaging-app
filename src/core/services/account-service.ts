import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { RegisterCreds, User } from '../../types/user';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
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
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('filters');
    this.currentUser.set(null);
  }
}
