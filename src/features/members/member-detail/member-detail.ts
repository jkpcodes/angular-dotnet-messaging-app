import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { filter } from 'rxjs';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AgePipe } from '../../../core/pipes/age-pipe';
import { AccountService } from '../../../core/services/account-service';
import { MemberService } from '../../../core/services/member-service';

@Component({
  selector: 'app-member-detail',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, AgePipe],
  templateUrl: './member-detail.html',
  styleUrl: './member-detail.css',
})
export class MemberDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private accountService = inject(AccountService);
  protected memberService = inject(MemberService);
  private destroyRef = inject(DestroyRef);
  protected title = signal<string | undefined>('Profile');
  protected isLoggedInUser = computed(() => {
    return this.memberService.member()?.id === this.accountService.currentUser()?.id;
  });

  ngOnInit() {
    this.title.set(this.route.firstChild?.snapshot.title);

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.title.set(this.route.firstChild?.snapshot.title);
      });
  }

  goBack() {
    this.location.back();
  }
}
