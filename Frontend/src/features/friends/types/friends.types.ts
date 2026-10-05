export interface FriendUser {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

export interface Friend {
  friendshipId: string;
  user: FriendUser;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  sender: FriendUser;
  createdAt: string;
}

export interface GameInvitePayload {
  fromUserId: string;
  fromName: string;
  roomCode: string;
  gameMode?: 'CLASSIC' | 'QUICK';
  maxPlayers?: number;
}
