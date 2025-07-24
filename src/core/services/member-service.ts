import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { EditableMember, Member, MemberParams } from '../../types/member';
import { Observable, tap } from 'rxjs';
import { Photo } from '../../types/photo';
import { PaginatedResult } from '../../types/pagination';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/members`;
  editMode = signal<boolean>(false);
  member = signal<Member | null>(null);

  getMembers(memberParams: MemberParams): Observable<PaginatedResult<Member>> {
    let params = new HttpParams();
    params = params.append('pageNumber', memberParams.pageNumber);
    params = params.append('pageSize', memberParams.pageSize);
    params = params.append('minAge', memberParams.minAge);
    params = params.append('maxAge', memberParams.maxAge);
    params = params.append('orderBy', memberParams.orderBy);

    if (memberParams.gender)
      params = params.append('gender', memberParams.gender);

    return this.http
      .get<PaginatedResult<Member>>(`${this.baseUrl}`, {
        params,
      })
      .pipe(
        // Store the filters in local storage
        tap(() => {
          localStorage.setItem('filters', JSON.stringify(memberParams));
        })
      );
  }

  getMember(id: string): Observable<Member> {
    return this.http
      .get<Member>(`${this.baseUrl}/${id}`)
      .pipe(tap((member) => this.member.set(member)));
  }

  getMemberPhotos(id: string): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.baseUrl}/${id}/photos`);
  }

  updateMember(member: EditableMember | Member) {
    return this.http.put(`${this.baseUrl}`, member);
  }

  uploadPhoto(file: File): Observable<Photo> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<Photo>(`${this.baseUrl}/upload-photo`, formData);
  }

  setMainPhoto(photo: Photo) {
    return this.http.put(`${this.baseUrl}/set-main-photo/${photo.id}`, {});
  }

  deletePhoto(photoId: number) {
    return this.http.delete(`${this.baseUrl}/delete-photo/${photoId}`);
  }
}
