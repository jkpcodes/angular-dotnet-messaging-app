import { Member } from "./member";

export type FriendRequest = {
  id: number;
  requestedById: string;
  requestedBy: Member;
  receiverId: string;
  receiver: Member;
  requestedAt: string;
  isAccepted: boolean;
};

export type FriendRequestIds = {
  sent: string[];
  received: string[];
};