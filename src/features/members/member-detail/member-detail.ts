import { Component, DestroyRef, inject, signal } from '@angular/core';
import { filter } from 'rxjs';
import { Member } from '../../../types/member';
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
  private destroyRef = inject(DestroyRef);
  protected title = signal<string | undefined>('Profile');

  protected member = signal<Member | undefined>(undefined);

  ngOnInit() {
    // Retrieve the member data from the memberResolver setup in app.routes.ts
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.member.set(data['member']);
      });

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
