import { Document, Types } from 'mongoose';
import { LudoGameState, GameStatus } from './engine/ludo.types';
import { PlayerColor, GameMode } from './engine/ludo.constants';

export interface IGameRoomPlayer {
  userId: Types.ObjectId;
  name: string;
  avatar?: string;
  color?: PlayerColor;
  isReady: boolean;
  isBot?: boolean;
  joinedAt: Date;
}

export interface IGameRoom extends Document {
  _id: Types.ObjectId;
  roomCode: string;
  creatorId: Types.ObjectId;
  maxPlayers: 2 | 4;
  gameMode: GameMode;
  players: IGameRoomPlayer[];
  status: GameStatus;
  gameState?: LudoGameState;
  turnTimeoutSeconds: number;
  turnDeadline?: Date;
  winnerUserId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoomDTO {
  maxPlayers: 2 | 4;
  gameMode?: GameMode;
}

export interface JoinRoomDTO {
  roomCode: string;
}

export interface MoveTokenDTO {
  roomCode: string;
  tokenId: number;
}
