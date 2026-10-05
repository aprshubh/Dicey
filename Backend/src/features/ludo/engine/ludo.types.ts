import { PlayerColor } from './ludo.constants';

export type TokenLocationState = 'BASE' | 'TRACK' | 'CORRIDOR' | 'HOME';

export interface TokenState {
  tokenId: number; // 0, 1, 2, 3
  color: PlayerColor;
  step: number; // -1 = BASE, 0..50 = TRACK, 51..55 = CORRIDOR, 56 = HOME
  state: TokenLocationState;
  commonSquare: number | null; // 0..51 if on common track
  corridorStep: number | null; // 1..5 if in home corridor
}

export interface PlayerGameState {
  userId: string;
  name: string;
  color: PlayerColor;
  tokens: TokenState[];
  hasFinished: boolean;
  rank?: number;
  consecutiveSixes: number;
  isBot?: boolean;
}

export type GameStatus = 'WAITING' | 'PLAYING' | 'FINISHED' | 'ABANDONED';

export interface LudoGameState {
  roomCode: string;
  gameMode: import('./ludo.constants').GameMode;
  status: GameStatus;
  players: PlayerGameState[];
  currentTurnIndex: number;
  currentTurnColor: PlayerColor;
  diceValue: number | null;
  hasRolledDice: boolean;
  validMoveTokenIds: number[];
  lastActionMessage: string;
  winners: { userId: string; color: PlayerColor; rank: number }[];
  updatedAt: Date;
}

export interface RollResult {
  diceValue: number;
  validMoves: number[];
  consecutiveSixes: number;
  turnPassed: boolean;
  bonusTurn: boolean;
  message: string;
}

export interface MoveResult {
  success: boolean;
  movedToken: TokenState;
  capturedToken?: {
    userId: string;
    color: PlayerColor;
    tokenId: number;
  };
  reachedHome: boolean;
  bonusTurn: boolean;
  bonusReason?: 'ROLLED_SIX' | 'CAPTURED_OPPONENT' | 'REACHED_HOME';
  nextTurnColor: PlayerColor;
  gameFinished: boolean;
  message: string;
}
