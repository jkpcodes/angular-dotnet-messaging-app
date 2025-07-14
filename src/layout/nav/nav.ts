import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/account-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoginCreds } from '../../types/user';

@Component({
  selector: 'app-nav',
  imports: [FormsModule],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav {
  protected accountService = inject(AccountService);
  private destroyRef = inject(DestroyRef);
  protected creds: LoginCreds = {
    email: '',
    password: ''
  };
  // protected isLoggedIn = signal(false);

  login() {
    this.accountService.login(this.creds)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          // this.isLoggedIn.set(true)
          this.creds = {
            email: '',
            password: ''
          };
        },
        error: (err) => {
          alert(err.message);
        }
      });
  }

  logout() {
    // this.isLoggedIn.set(false);
    this.accountService.logout();
  }
}
