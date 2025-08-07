import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { take } from 'rxjs';
import { PaginatedResult } from '../../types/pagination';
import { Message } from '../../types/message';
import { AccountService } from './account-service';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private baseUrl = `${environment.apiUrl}/messages`;
  private hubUrl = environment.hubUrl;
  private http = inject(HttpClient);
  private accountService = inject(AccountService);
  private hubConnection?: HubConnection;
  messageThread = signal<Message[]>([]);

  createHubConnection(otherUserId: string) {
    const currentUser = this.accountService.currentUser();
    if (!currentUser) return;

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}/messages?userId=${otherUserId}`, {
        accessTokenFactory: () => currentUser.token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(error => console.log(error));

    this.hubConnection.on("ReceiveMessageThread", (messages: Message[]) => {
      this.messageThread.set(
        messages.map((message) => ({
          ...message,
          currentUserSender: message.senderId != otherUserId,
        }))
      );
    });

    this.hubConnection.on("NewMessage", (message: Message) => {
      message.currentUserSender = message.senderId != otherUserId;
      this.messageThread.update(messages => [...messages, message]);
    });
  }

  stopHubConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop().catch(error => console.log(error));
      this.messageThread.set([]);
    }
  }

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
    return this.hubConnection?.invoke("SendMessage", { recipientId, content });
  }

  deleteMessage(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(take(1));
  }
}
