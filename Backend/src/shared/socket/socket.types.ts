import { Socket } from 'socket.io';
import { UserRole } from '../../features/auth/auth.interface';
import { LudoGameState, RollResult, MoveResult } from '../../features/ludo/engine/ludo.types';

export interface AuthenticatedSocketUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  avatar?: string;
}

export interface SocketData {
  user: AuthenticatedSocketUser;
  currentRoom?: string;
}

// Client to Server Events
export interface ClientToServerEvents {
  join_room: (data: { roomCode: string }) => void;
  leave_room: (data: { roomCode: string }) => void;
  start_game: (data: { roomCode: string }) => void;
  roll_dice: (data: { roomCode: string }) => void;
  move_token: (data: { roomCode: string; tokenId: number }) => void;
  send_emoji: (data: { roomCode: string; emoji: string }) => void;
  // Matchmaking events
  find_match: (data: { maxPlayers: 2 | 4 }) => void;
  cancel_matchmaking: () => void;
  // Live Friend Match Invites
  invite_friend: (data: { friendId: string; roomCode: string }) => void;
  decline_invite: (data: { roomCode: string; fromUserId: string }) => void;
}

// Server to Client Events
export interface ServerToClientEvents {
  player_joined: (data: { userId: string; name: string; totalPlayers: number }) => void;
  player_left: (data: { userId: string; name: string }) => void;
  game_started: (data: { gameState: LudoGameState }) => void;
  dice_rolled: (data: { userId: string; rollResult: RollResult; gameState: LudoGameState }) => void;
  token_moved: (data: { userId: string; moveResult: MoveResult; gameState: LudoGameState }) => void;
  turn_timer: (data: { currentTurnColor: string; remainingSeconds: number }) => void;
  turn_timeout: (data: { userId: string; message: string; gameState: LudoGameState }) => void;
  emoji_received: (data: { userId: string; name: string; emoji: string }) => void;
  game_finished: (data: { winners: { userId: string; color: string; rank: number }[]; gameState: LudoGameState }) => void;
  error_event: (data: { message: string }) => void;
  // Matchmaking events
  matchmaking_searching: (data: { maxPlayers: 2 | 4; queueSize: number }) => void;
  match_found: (data: { roomCode: string; color: string; gameState: LudoGameState }) => void;
  matchmaking_cancelled: () => void;
  // Live Friend Match Invites
  game_invite_received: (data: {
    fromUserId: string;
    fromName: string;
    fromAvatar?: string;
    roomCode: string;
    maxPlayers: number;
    gameMode: string;
  }) => void;
  invite_declined: (data: { byUserId: string; byName: string; roomCode: string }) => void;
}

export type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
