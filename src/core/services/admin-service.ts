import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { take } from 'rxjs';
import { User } from '../../types/user';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  baseUrl = `${environment.apiUrl}/admin`;
  private http = inject(HttpClient);

  getUsersWithRoles() {
    return this.http
      .get<User[]>(`${this.baseUrl}/users-with-roles`)
      .pipe(take(1));
  }

  updateUserRoles(userId: string, roles: string[]) {
    return this.http
      .post<string[]>(`${this.baseUrl}/edit-roles/${userId}?roles=${roles}`, {})
      .pipe(take(1));
  }
}
