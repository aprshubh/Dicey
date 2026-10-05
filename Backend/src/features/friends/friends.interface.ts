import { Document, Types } from 'mongoose';
import { UserRole } from '../auth/auth.interface';

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface IFriendship extends Document {
  _id: Types.ObjectId;
  userA: Types.ObjectId; // Lexicographically smaller ObjectId for compound unique indexing
  userB: Types.ObjectId; // Lexicographically larger ObjectId
  requester: Types.ObjectId; // User who initiated the request or block
  recipient: Types.ObjectId; // Target user of the request or block
  status: FriendshipStatus;
  actionUserId: Types.ObjectId; // Last user who updated the status (e.g. accepted, blocked, rejected)
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isOnline: boolean;
  lastActive?: Date;
  friendsSince?: Date;
}

export interface FriendRequestItem {
  requestId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    isOnline: boolean;
  };
  sentAt: Date;
}

export interface SearchUserResult {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  relationshipStatus: 'none' | 'friends' | 'request_sent' | 'request_received' | 'blocked' | 'blocked_by';
  isOnline: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}
