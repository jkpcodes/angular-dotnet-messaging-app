export type Member = {
  id: string;
  dateOfBirth: string;
  imageUrl?: string;
  displayName: string;
  created: string;
  lastActive: string;
  gender: string;
  description?: string;
  city: string;
  country: string;
};

export type EditableMember = {
  displayName: string;
  description: string;
  city: string;
  country: string;
};

export class MemberParams {
  gender?: string;
  minAge: number = 18;
  maxAge: number = 100;
  pageNumber = 1;
  pageSize = 10;
  orderBy = 'lastActive';
}