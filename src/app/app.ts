import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Nav } from "../layout/nav/nav";
import { BusyService } from '../core/services/busy-service';
import { ConfirmDialog } from "../shared/confirm-dialog/confirm-dialog";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Nav, ConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected router = inject(Router);
  protected busyService = inject(BusyService);
}
