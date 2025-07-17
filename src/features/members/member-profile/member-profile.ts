import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Member } from '../../../types/member';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-member-profile',
  imports: [DatePipe],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css',
})
export class MemberProfile {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  protected member = signal<Member | undefined>(undefined);

  ngOnInit() {
    this.route.parent?.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.member.set(data['member']);
      });
  }
}
