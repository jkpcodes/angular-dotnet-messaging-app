import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoginCreds } from '../../types/user';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastService } from '../../core/services/toast-service';
import { themes } from '../theme';
import { BusyService } from '../../core/services/busy-service';
import { HasRole } from '../../shared/directives/has-role';

@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink, RouterLinkActive, HasRole],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav implements OnInit {
  protected accountService = inject(AccountService);
  protected busyService = inject(BusyService);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  protected creds: LoginCreds = {
    email: '',
    password: '',
  };
  protected selectedTheme = signal<string>(
    localStorage.getItem('theme') || 'light'
  );
  protected themes = themes;

  ngOnInit(): void {
    document.documentElement.setAttribute('data-theme', this.selectedTheme());
  }

  handleSelectTheme(theme: string) {
    this.selectedTheme.set(theme);
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.closeDropdown();
  }

  login() {
    this.accountService
      .login(this.creds)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.creds = {
            email: '',
            password: '',
          };
          this.router.navigateByUrl('/members');
          this.toastService.success('Login successful');
        },
        error: (err) => {
          console.log(err);
          this.toastService.error(err.error);
        },
      });
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }

  closeDropdown() {
    const elem = document.activeElement as HTMLDivElement;
    if (elem) elem.blur();
  }

  goToUserProfile() {
    this.router.navigateByUrl(
      `/members/${this.accountService.currentUser()?.id}`
    );

    this.closeDropdown();
  }
}
