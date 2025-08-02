import {
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { AdminService } from '../../../core/services/admin-service';
import { User } from '../../../types/user';

@Component({
  selector: 'app-user-management',
  imports: [],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagement implements OnInit {
  @ViewChild('rolesModal') rolesModal?: ElementRef<HTMLDialogElement>;
  private adminService = inject(AdminService);
  protected users = signal<User[]>([]);
  protected availableRoles = ['Member', 'Moderator', 'Admin'];
  protected selectedUser: User | null = null;
  protected isUpdatingRole: boolean = false;

  ngOnInit(): void {
    this.getUserWithRoles();
  }

  getUserWithRoles() {
    this.adminService.getUsersWithRoles().subscribe({
      next: (users) => {
        this.users.set(users);
      },
    });
  }

  openRolesModal(user: User) {
    this.selectedUser = user;
    this.rolesModal?.nativeElement.showModal();
  }

  toggleRole(event: Event, role: string) {
    if (!this.selectedUser) return;

    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.selectedUser.roles?.push(role);
    } else {
      this.selectedUser.roles = this.selectedUser.roles?.filter(
        (r) => r !== role
      );
    }
  }

  updateRoles() {
    if (!this.selectedUser) return;

    this.isUpdatingRole = true;

    console.log(this.selectedUser.roles);

    this.adminService.updateUserRoles(
      this.selectedUser.id,
      this.selectedUser.roles
    ).subscribe({
      next: (roles) => {
        this.users.update(users => users.map((user) => {
          if (user.id === this.selectedUser?.id) user.roles = roles;
          return user;
        }));

        // Close edit roles modal
        this.rolesModal?.nativeElement.close();
      },
      error: (error) => {
        console.log('Failed to update user roles', error);
      },
      complete: () => {
        this.isUpdatingRole = false;
      }
    })
  }
}
