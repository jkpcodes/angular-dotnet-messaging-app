import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { RegisterCreds, User } from '../types/user';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  currentUser = signal<User | null>(null);

  baseUrl = 'https://localhost:5001/api/account/';

  register(creds: RegisterCreds) {
    return this.http.post<User>(this.baseUrl + 'register', creds).pipe(
      tap((userData) => {
        if (userData) {
          this.setCurrentUser(userData);
        }
      })
    );
  }

  login(creds: any) {
    return this.http.post<User>(this.baseUrl + 'login', creds).pipe(
      tap((userData) => {
        if (userData) {
          this.setCurrentUser(userData);
        }
      })
    );
  }

  setCurrentUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }
}
