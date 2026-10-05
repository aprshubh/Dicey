import { Schema, model } from 'mongoose';
import { IGameRoom } from './ludo.interface';

const gameRoomPlayerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      enum: ['RED', 'GREEN', 'YELLOW', 'BLUE'],
    },
    isReady: {
      type: Boolean,
      default: false,
    },
    isBot: {
      type: Boolean,
      default: false,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const gameRoomSchema = new Schema<IGameRoom>(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    maxPlayers: {
      type: Number,
      enum: [2, 4],
      default: 4,
    },
    gameMode: {
      type: String,
      enum: ['CLASSIC', 'QUICK'],
      default: 'CLASSIC',
    },
    players: [gameRoomPlayerSchema],
    status: {
      type: String,
      enum: ['WAITING', 'PLAYING', 'FINISHED', 'ABANDONED'],
      default: 'WAITING',
      index: true,
    },
    gameState: {
      type: Schema.Types.Mixed,
      default: null,
    },
    turnTimeoutSeconds: {
      type: Number,
      default: 30,
    },
    turnDeadline: {
      type: Date,
    },
    winnerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const GameRoom = model<IGameRoom>('GameRoom', gameRoomSchema);
