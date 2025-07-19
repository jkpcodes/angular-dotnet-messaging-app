import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { EditableMember, Member } from '../../../types/member';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { MemberService } from '../../../core/services/member-service';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastService } from '../../../core/services/toast-service';
import { AccountService } from '../../../core/services/account-service';

@Component({
  selector: 'app-member-profile',
  imports: [DatePipe, FormsModule],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css',
})
export class MemberProfile implements OnInit, OnDestroy {
  @ViewChild('editForm') editForm?: NgForm;
  @HostListener('window:beforeunload', ['$event']) notify($event: BeforeUnloadEvent) {
    if (this.editForm?.dirty) {
      $event.preventDefault();
    }
  }
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private accountService = inject(AccountService);
  protected memberService = inject(MemberService);
  protected editableMember: EditableMember = {
    displayName: '',
    description: '',
    city: '',
    country: '',
  };

  ngOnInit() {
    this.editableMember = {
      displayName: this.memberService.member()?.displayName || '',
      description: this.memberService.member()?.description || '',
      city: this.memberService.member()?.city || '',
      country: this.memberService.member()?.country || '',
    };
  }

  ngOnDestroy() {
    if (this.memberService.editMode()) {
      this.memberService.editMode.set(false);
    }
  }

  updateProfile() {
    const currentMember = this.memberService.member();
    if (!currentMember) return;

    const updatedMember: Member = { ...currentMember, ...this.editableMember };

    this.memberService.updateMember(updatedMember)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const currentUser = this.accountService.currentUser();
          if (currentUser && currentUser.displayName !== updatedMember.displayName) {
            currentUser.displayName = updatedMember.displayName;
            this.accountService.setCurrentUser(currentUser);
          }

          this.toast.success('Profile updated successfully');
          this.memberService.editMode.set(false);
          this.memberService.member.set(updatedMember);
          this.editForm?.reset(updatedMember);
        },
        error: () => {
          this.toast.error('Failed to update profile');
        }
      });
  }
}
