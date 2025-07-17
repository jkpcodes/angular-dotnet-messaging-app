import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

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

  private createToastElement(message: string, alertClass: string, duration: number = 5000): void {
    // Check if toast container exists
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `alert ${alertClass} shadow-lg`;
    toast.innerHTML = `
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

  success(message: string, duration?: number): void {
    this.createToastElement(message, 'alert-success', duration);
  }

  error(message: string, duration?: number): void {
    this.createToastElement(message, 'alert-error', duration);
  }

  warning(message: string, duration?: number): void {
    this.createToastElement(message, 'alert-warning', duration);
  }

  info(message: string, duration?: number): void {
    this.createToastElement(message, 'alert-info', duration);
  }
}
