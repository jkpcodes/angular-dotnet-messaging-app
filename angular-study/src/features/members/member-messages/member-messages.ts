import { Component, DestroyRef, effect, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { MessageService } from '../../../core/services/message-service';
import { MemberService } from '../../../core/services/member-service';
import { Message } from '../../../types/message';
import { TimeAgoPipe } from '../../../core/pipes/time-ago-pipe';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PresenceService } from '../../../core/services/presence-service';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-member-messages',
  imports: [DatePipe, TimeAgoPipe, FormsModule],
  templateUrl: './member-messages.html',
  styleUrl: './member-messages.css',
})
export class MemberMessages implements OnInit, OnDestroy {
  @ViewChild('messageEndRef') messageEndRef?: ElementRef;
  protected messageService = inject(MessageService);
  private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  protected presenceService = inject(PresenceService);
  protected messageContent = '';

  constructor() {
    effect(() => {
      const currentMessages = this.messageService.messageThread();
      if (currentMessages.length > 0) {
        this.scrollToBottom();
      }
    });
  }

  ngOnDestroy() {
    this.messageService.stopHubConnection();
  }

  ngOnInit() {
    this.route.parent?.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (params) => {
          const otherUserId = params.get('id');
          if (!otherUserId) throw new Error('Cannot connect to hub');

          this.messageService.createHubConnection(otherUserId);
        }
      });
  }

  sendMessage() {
    const recipientId = this.memberService.member()?.id;

    if (!recipientId || !this.messageContent) return;

    this.messageService.sendMessage(recipientId, this.messageContent)
      ?.then(() => {
        this.messageContent = '';
      });
  }

  scrollToBottom() { 
    setTimeout(() => {
      if (this.messageEndRef) {
        this.messageEndRef.nativeElement.scrollIntoView({behavior: 'smooth'});
      }
    });
  }
}
