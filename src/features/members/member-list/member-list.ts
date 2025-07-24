import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { Member, MemberParams } from '../../../types/member';
import { MemberCard } from '../member-card/member-card';
import { PaginatedResult } from '../../../types/pagination';
import { Paginator } from '../../../shared/paginator/paginator';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FilterModal } from '../filter-modal/filter-modal';

@Component({
  selector: 'app-member-list',
  imports: [MemberCard, Paginator, FilterModal],
  templateUrl: './member-list.html',
  styleUrl: './member-list.css',
})
export class MemberList implements OnInit {
  @ViewChild('filterModal') modal?: FilterModal;
  private memberService = inject(MemberService);
  private destroyRef = inject(DestroyRef);
  protected paginatedMembers = signal<PaginatedResult<Member> | null>(null);
  protected memberParams = new MemberParams();
  private updatedParams = new MemberParams();

  constructor() {
    const filtersString = localStorage.getItem('filters');
    if (filtersString) {
      const filters = JSON.parse(filtersString);
      this.memberParams = filters;
      this.updatedParams = filters;
    }
  }

  ngOnInit(): void {
    // this.memberService.getMembers(this.memberParams)
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe(result => {
    //     this.paginatedMembers.set(result);
    //   });
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMembers(this.memberParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.paginatedMembers.set(result);
      });
  }

  onPageChange(event: { pageNumber: number; pageSize: number }) {
    this.memberParams.pageNumber = event.pageNumber;
    this.memberParams.pageSize = event.pageSize;
    this.loadMembers();
  }

  openModal() {
    this.modal?.open();
  }

  onClose() {
    console.log('modal closed');
  }

  onFilterChange(data: MemberParams) {
    this.memberParams = {...data};
    this.updatedParams = {...data};
    this.loadMembers();
  }

  resetFilters() {
    this.memberParams = new MemberParams();
    this.updatedParams = new MemberParams();
    this.loadMembers();
  }

  get displayMessage(): string {
    const defaultParams = new MemberParams();

    const filters: string[] = [];

    if (this.updatedParams.gender) {
      filters.push(this.updatedParams.gender[0].toUpperCase() + this.updatedParams.gender.slice(1) + 's');
    } else {
      filters.push('Males, Females');
    }

    if (this.updatedParams.minAge !== defaultParams.minAge
      || this.updatedParams.maxAge !== defaultParams.maxAge) {
      filters.push(`ages ${this.updatedParams.minAge} - ${this.updatedParams.maxAge}`);
    }

    filters.push(this.updatedParams.orderBy === 'lastActive' ? 'Recently active' : 'Newest members');

    return filters.length > 0 ? `Selected : ${filters.join('  | ')}` : 'All members';
  }
}
