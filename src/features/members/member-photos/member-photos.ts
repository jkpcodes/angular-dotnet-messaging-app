import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Photo } from '../../../types/photo';
import { switchMap } from 'rxjs';
import { ImageUpload } from '../../../shared/image-upload/image-upload';
import { AccountService } from '../../../core/services/account-service';
import { StarButton } from '../../../shared/star-button/star-button';
import { DeleteButton } from '../../../shared/delete-button/delete-button';

@Component({
  selector: 'app-member-photos',
  imports: [ImageUpload, StarButton, DeleteButton],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css',
})
export class MemberPhotos implements OnInit {
  protected memberService = inject(MemberService);
  protected accountService = inject(AccountService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  protected photos = signal<Photo[]>([]);
  protected loading = signal<boolean>(false);

  ngOnInit(): void {
    this.route.parent?.paramMap
      .pipe(
        switchMap((params) =>
          this.memberService.getMemberPhotos(params.get('id')!)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((photos) => {
        this.photos.set(photos);
      });
  }

  onUploadImage(file: File) {
    this.loading.set(true);
    this.memberService
      .uploadPhoto(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (photo) => {
          this.memberService.editMode.set(false);
          this.loading.set(false);
          this.photos.update((photos) => [...photos, photo]);

          if (!this.memberService.member()?.imageUrl) {
            this.setMainLocalPhoto(photo);
          }
        },
        error: (error) => {
          console.log('Error uploading photo: ', error);
          this.loading.set(false);
        },
      });
  }

  setMainPhoto(photo: Photo) {
    this.memberService
      .setMainPhoto(photo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.setMainLocalPhoto(photo);
        },
      });
  }

  deletePhoto(photoId: number) {
    this.memberService
      .deletePhoto(photoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.photos.update((photos) =>
            photos.filter((p) => p.id !== photoId)
          );
        },
      });
  }

  private setMainLocalPhoto(photo: Photo) {
    const currentUser = this.accountService.currentUser();
    if (currentUser) {
      currentUser.imageUrl = photo.url;
      this.accountService.setCurrentUser(currentUser);

      this.memberService.member.update((member) => {
        if (member) {
          member.imageUrl = photo.url;
          return { ...member };
        }
        return member;
      });
    }
  }
}
