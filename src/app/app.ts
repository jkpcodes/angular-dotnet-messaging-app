import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Nav } from "../layout/nav/nav";
import { AccountService } from '../core/account-service';
import { Home } from "../features/home/home";
import { User } from '../types/user';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, Nav, Home],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private accountService = inject(AccountService);
  private http = inject(HttpClient);
  protected readonly title = signal('Client App');
  protected members = signal<User[]>([]);

  ngOnInit() {
    this.setCurrentUser();
    this.getMembers();
  }

  setCurrentUser() {
    const user = localStorage.getItem('user');
    if (user) {
      this.accountService.currentUser.set(JSON.parse(user));
    }
  }

  getMembers() {
    this.http.get<User[]>('https://localhost:5001/api/members').subscribe({
      next: (data) => {
        this.members.set(data);
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        console.log('Request completed');
      },
    });
  }
}
