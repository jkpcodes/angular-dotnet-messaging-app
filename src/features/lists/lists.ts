import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FriendsService } from '../../core/services/friends-service';
import { Member } from '../../types/member';
import { MemberCard } from '../members/member-card/member-card';
import { FriendRequest } from '../../types/friend';
import { AccountService } from '../../core/services/account-service';
import { PaginatedResult } from '../../types/pagination';
import { Paginator } from "../../shared/paginator/paginator";

@Component({
  selector: 'app-lists',
  imports: [MemberCard, Paginator],
  templateUrl: './lists.html',
  styleUrl: './lists.css',
})
export class Lists implements OnInit {
  private friendsService = inject(FriendsService);
  private accountService = inject(AccountService);
  protected friends = signal<Member[]>([]);
  protected friendRequests = signal<Member[]>([]);
  protected sentInvites = signal<Member[]>([]);
  protected friendsPaginatedResult = signal<PaginatedResult<Member> | null>(null);
  protected friendRequestsPaginatedResult = signal<PaginatedResult<FriendRequest> | null>(null);
  protected sentInvitesPaginatedResult = signal<PaginatedResult<FriendRequest> | null>(null);
  protected pageNumber = 1;
  protected pageSize = 5;
  selectedTab = signal<string>('friends');
  protected currentPaginatedResult = computed(() => {
    if (this.selectedTab() === 'pending') {
      return this.friendRequestsPaginatedResult()
    } else if (this.selectedTab() === 'sent') {
      return this.sentInvitesPaginatedResult();
    } else {
      return this.friendsPaginatedResult();
    }
  });

  tabs = [
    { label: 'Friends', value: 'friends' },
    { label: 'Pending Requests', value: 'pending' },
    { label: 'Sent Requests', value: 'sent' },
  ];

  ngOnInit(): void {
    this.loadFriends();
    this.loadFriendRequests();
    this.loadSentRequests();
  }

  loadFriends() {
    this.friendsService.getFriends(this.pageNumber, this.pageSize).subscribe({
      next: (value) => {
        this.friendsPaginatedResult.set(value);
        this.friends.set(value.items);
      }
    });
  }

  loadFriendRequests() {
    this.friendsService.getFriendRequest('received', this.pageNumber, this.pageSize).subscribe({
      next: (value: PaginatedResult<FriendRequest>) => {
        this.friendRequestsPaginatedResult.set(value);
        const friendRequests = value.items
          .filter(
            (request) =>
              request.receiverId === this.accountService.currentUser()?.id
          )
          .map((x) => x.requestedBy);

        this.friendRequests.set(friendRequests.length ? friendRequests : []);
      }
    });
  }

  loadSentRequests() {
    this.friendsService.getFriendRequest('sent', this.pageNumber, this.pageSize).subscribe({
      next: (value: PaginatedResult<FriendRequest>) => {
        this.sentInvitesPaginatedResult.set(value);
        const sentInvites = value.items
          .filter(
            (request) =>
              request.requestedById === this.accountService.currentUser()?.id
          )
          .map((x) => x.receiver);

        this.sentInvites.set(sentInvites.length ? sentInvites : []);
      },
    });

  }

  selectTab(value: string) {
    this.pageNumber = 1;
    this.selectedTab.set(value);
  }

  onPageChange(event: { pageNumber: number; pageSize: number }) {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageNumber;

    if (this.selectedTab() == 'pending') {
      this.loadFriendRequests();
    } else if (this.selectedTab() == 'sent') {
      this.loadSentRequests();
    } else {
      this.loadFriends();
    }
  }
}
