import { Component, computed, inject, input } from '@angular/core';
import { Member } from '../../../types/member';
import { Router, RouterLink } from '@angular/router';
import { FriendsService } from '../../../core/services/friends-service';

@Component({
  selector: 'app-member-card',
  imports: [RouterLink],
  templateUrl: './member-card.html',
  styleUrl: './member-card.css',
})
export class MemberCard {
  protected friendService = inject(FriendsService);
  private router = inject(Router);
  isFriend = input<boolean>(false);
  member = input.required<Member>();
  sentFriendRequest = computed(() =>
    this.friendService.sentFriendRequestIds().includes(this.member().id)
  );
  receivedFriendRequest = computed(() =>
    this.friendService.receivedFriendRequestIds().includes(this.member().id)
  );

  sendFriendRequest(event: Event) {
    event.stopPropagation();

    this.friendService.sendFriendRequest(this.member().id).subscribe();
  }

  acceptFriendRequest(event: Event) {
    event.stopPropagation();

    this.friendService.acceptFriendRequest(this.member().id).subscribe();
  }

  cancelFriendRequest(event: Event) {
    event.stopPropagation();

    this.friendService.cancelFriendRequest(this.member().id).subscribe();
  }

  rejectFriendRequest(event: Event) {
    event.stopPropagation();

    this.friendService.rejectFriendRequest(this.member().id).subscribe();
  }

  goToFriendMessages(event: Event) {
    event.stopPropagation();

    this.router.navigateByUrl(`/members/${this.member().id}/messages`);
  }
}
