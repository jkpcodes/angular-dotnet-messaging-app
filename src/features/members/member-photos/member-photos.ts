import { Component, DestroyRef, inject, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Photo } from '../../../types/photo';
import { Observable, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-member-photos',
  imports: [AsyncPipe],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css',
})
export class MemberPhotos {
  private memberService = inject(MemberService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  protected photos$?: Observable<Photo[]> = this.route.parent?.paramMap.pipe(
    switchMap((params) => this.memberService.getMemberPhotos(params.get('id')!)),
    takeUntilDestroyed(this.destroyRef)
  );

  getPhotoMocks() {
    return Array.from( {length: 20}, (_, i) => ({
      url: '/user.png'
    }));
  }
}
