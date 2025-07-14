import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoginCreds } from '../../types/user';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastService } from '../../core/services/toast-service';

@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav {
  protected accountService = inject(AccountService);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  protected creds: LoginCreds = {
    email: '',
    password: ''
  };

  login() {
    this.accountService.login(this.creds)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.creds = {
            email: '',
            password: ''
          };
          this.router.navigateByUrl('/members');
          this.toastService.success('Login successful');
        },
        error: (err) => {
          console.log(err);
          this.toastService.error(err.error);
        }
      });
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }
}
