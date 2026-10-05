export interface QueueTicket {
  userId: string;
  socketId: string;
  name: string;
  avatar?: string;
  maxPlayers: 2 | 4;
  queuedAt: Date;
}

export interface MatchmakingResult {
  roomCode: string;
  matchedPlayers: QueueTicket[];
}
