export type PlayerColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';

export interface Token {
  id: number; // 0, 1, 2, 3
  position: number; // -1 for Base, 0-51 for track, 100-105 for home corridor, 999 for finished
  stepCount: number; // 0 to 57
  isHome: boolean;
}

export interface Player {
  userId: string;
  name: string;
  color: PlayerColor;
  tokens: Token[];
  isConnected: boolean;
  isBot?: boolean;
  avatarUrl?: string;
  timeRemaining?: number;
}

export interface GameState {
  roomCode: string;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  gameMode: 'CLASSIC' | 'QUICK';
  maxPlayers: 2 | 4;
  players: Player[];
  currentTurnColor: PlayerColor;
  diceValue: number | null;
  turnTimeRemaining: number;
  consecutiveSixes: number;
  validMoves?: number[];
  winners?: Array<{ userId: string; rank: number; color: PlayerColor }>;
}

export interface GameLogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'roll' | 'move' | 'capture' | 'system' | 'chat';
  color?: PlayerColor;
  emoji?: string;
}
