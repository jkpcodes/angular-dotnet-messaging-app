import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, take, tap } from 'rxjs';
import { FriendRequest, FriendRequestIds } from '../../types/friend';
import { Member } from '../../types/member';
import { PaginatedResult } from '../../types/pagination';

@Injectable({
  providedIn: 'root',
})
export class FriendsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/friendrequest`;
  sentFriendRequestIds = signal<string[]>([]);
  receivedFriendRequestIds = signal<string[]>([]);

  sendFriendRequest(memberId: string) {
    return this.http.post(`${this.baseUrl}/${memberId}`, null).pipe(
      take(1),
      tap(() => {
        this.sentFriendRequestIds.update((ids) => [...ids, memberId]);
      })
    );
  }

  getFriendRequest(predicate: string, pageNumber: number, pageSize: number) {
    let params = new HttpParams();

    params = params.append('predicate', predicate);
    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize);

    return this.http
      .get<PaginatedResult<FriendRequest>>(`${this.baseUrl}/list`, { params })
      .pipe(take(1));
  }

  getFriendRequestIds() {
    return this.http
      .get<FriendRequestIds>(`${this.baseUrl}/list-ids`)
      .pipe(
        take(1),
        tap((response: FriendRequestIds) => {
          this.sentFriendRequestIds.set(response.sent);
          this.receivedFriendRequestIds.set(response.received);
        })
      )
      .subscribe();
  }

  getFriends(pageNumber: number, pageSize: number): Observable<PaginatedResult<Member>> {
    let params = new HttpParams();

    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageNumber);

    return this.http.get<PaginatedResult<Member>>(`${this.baseUrl}/friend-list`).pipe(
      take(1),
      tap((response: PaginatedResult<Member>) => {
        console.log(response);
      })
    );
  }

  clearRequestIds() {
    this.sentFriendRequestIds.set([]);
    this.receivedFriendRequestIds.set([]);
  }

  acceptFriendRequest(memberId: string) {
    return this.http.post(`${this.baseUrl}/${memberId}/accept`, null).pipe(
      take(1),
      tap(() => {
        this.receivedFriendRequestIds.update((ids) =>
          ids.filter((x) => x != memberId)
        );
      })
    );
  }

  cancelFriendRequest(memberId: string) {
    return this.http.post(`${this.baseUrl}/${memberId}/cancel`, {}).pipe(
      take(1),
      tap(() => {
        this.sentFriendRequestIds.update((ids) =>
          ids.filter((x) => x != memberId)
        );
      })
    );
  }

  rejectFriendRequest(memberId: string) {
    return this.http.post(`${this.baseUrl}/${memberId}/reject`, {}).pipe(
      take(1),
      tap(() => {
        this.receivedFriendRequestIds.update((ids) =>
          ids.filter((x) => x != memberId)
        );
      })
    );
  }
}
