import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { take } from 'rxjs';
import { PaginatedResult } from '../../types/pagination';
import { Message } from '../../types/message';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private baseUrl = `${environment.apiUrl}/messages`;
  private http = inject(HttpClient);

  getMessages(container: string, pageNumber: number, pageSize: number) {
    let params = new HttpParams();

    params = params.append('container', container);
    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize);

    return this.http
      .get<PaginatedResult<Message>>(this.baseUrl, { params })
      .pipe(take(1));
  }

  getMessageThread(memberId: string) {
    return this.http
      .get<Message[]>(`${this.baseUrl}/thread/${memberId}`)
      .pipe(take(1));
  }

  sendMessage(recipientId: string, content: string) {
    return this.http
      .post<Message>(this.baseUrl, {
        recipientId,
        content,
      })
      .pipe(take(1));
  }

  deleteMessage(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(take(1));
  }
}
