import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegisterCreds, User } from '../../../types/user';
import { AccountService } from '../../../core/services/account-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private accountService = inject(AccountService);
  cancelRegister = output<boolean>();
  private destroyRef = inject(DestroyRef);
  protected creds = {} as RegisterCreds;
  protected confirmPassword = '';

  register() {
    this.accountService.register(this.creds)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cancelRegister.emit(false);
        },
        error: (error) => {
          console.log(error);
        },
        complete: () => {
          console.log('Request completed');
        },
      });
  }

  cancel() {
    console.log('cancelled!');
    this.cancelRegister.emit(false);
  }
}
