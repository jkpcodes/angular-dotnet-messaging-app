import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-test-errors',
  imports: [],
  templateUrl: './test-errors.html',
  styleUrl: './test-errors.css'
})
export class TestErrors {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  baseUrl = environment.apiUrl;
  validationErrors = signal<string[]>([]);

  get404Error() {
    this.http.get(this.baseUrl + 'buggy/not-found')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => console.log(response),
        error: (error) => console.log(error),
      });
  }

  get500Error() {
    this.http.get(this.baseUrl + 'buggy/server-error')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => console.log(response),
        error: (error) => console.log(error),
    });
  }

  get401Error() {
    this.http.get(this.baseUrl + 'buggy/auth')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => console.log(response),
        error: (error) => console.log(error),
    });
  }

  get400Error() {
    this.http.post(this.baseUrl + 'account/register', {})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => console.log(response),
        error: (error) => {
          console.log(error);
          this.validationErrors.set(error);
        },
    });
  }
}
