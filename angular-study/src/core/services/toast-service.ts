import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private router = inject(Router);

  constructor() {
    this.createToastContainer();
  }

  private createToastContainer(): void {
    if (!document.getElementById('toast-container')) {
      const toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast toast-bottom toast-end';
      document.body.appendChild(toastContainer);
    }
  }

  private createToastElement(
    message: string,
    alertClass: string,
    duration: number = 5000,
    avatar?: string,
    route?: string
  ): void {
    // Check if toast container exists
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `alert ${alertClass} shadow-lg flex items-center gap-3 cursor-pointer`;

    if (route) {
      toast.addEventListener('click', () => this.router.navigateByUrl(route));
    }

    toast.innerHTML = `
      ${avatar ? `<img src=${avatar || '/user.png'} class='w-10' h-10 rounded'` : ''};
      <span>${message}</span>
      <button class="ml-4 btn btn-sm btn-ghost">X</button>
    `;

    // Add click event listener to remove toast when 'X' button is clicked
    toast.querySelector('button')?.addEventListener('click', () => {
      toast.remove();
    });

    // Add toast to container
    toastContainer.appendChild(toast);

    // Remove toast after duration
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toast.remove();
      }
    }, duration);
  }

  success(message: string, duration?: number, avatar?: string, route?: string): void {
    this.createToastElement(message, 'alert-success', duration, avatar, route);
  }

  error(message: string, duration?: number, avatar?: string, route?: string): void {
    this.createToastElement(message, 'alert-error', duration, avatar, route);
  }

  warning(message: string, duration?: number, avatar?: string, route?: string): void {
    this.createToastElement(message, 'alert-warning', duration, avatar, route);
  }

  info(message: string, duration?: number, avatar?: string, route?: string): void {
    this.createToastElement(message, 'alert-info', duration, avatar, route);
  }
}
