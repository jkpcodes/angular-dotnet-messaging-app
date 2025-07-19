import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { EditableMember, Member } from '../../types/member';
import { Observable, tap } from 'rxjs';
import { Photo } from '../../types/photo';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/members`;
  editMode = signal<boolean>(false);
  member = signal<Member | null>(null);

  getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.baseUrl);
  }

  getMember(id: string): Observable<Member> {
    return this.http.get<Member>(`${this.baseUrl}/${id}`)
      .pipe(
        tap((member) => this.member.set(member))
      );
  }

  getMemberPhotos(id: string): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.baseUrl}/${id}/photos`);
  }

  updateMember(member: EditableMember | Member) {
    return this.http.put(`${this.baseUrl}`, member);
  }
}
