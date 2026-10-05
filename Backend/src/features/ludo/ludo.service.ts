import crypto from 'crypto';
import { Types } from 'mongoose';
import { GameRoom } from './ludo.model';
import { User } from '../auth/auth.model';
import { LudoEngine } from './engine/ludo.engine';
import { ApiError } from '../../shared/errors/apiError';
import { IGameRoom, CreateRoomDTO } from './ludo.interface';
import { RollResult, MoveResult, LudoGameState } from './engine/ludo.types';

class LudoService {
  /**
   * Generates a 6-character random room code (e.g. "LD89X2")
   */
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars like O, 0, I, 1
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(crypto.randomInt(0, chars.length));
    }
    return code;
  }

  /**
   * Create a new Ludo game room
   */
  async createRoom(userId: string, dto: CreateRoomDTO): Promise<IGameRoom> {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    let roomCode = this.generateRoomCode();
    let collisionCheck = await GameRoom.findOne({ roomCode });
    while (collisionCheck) {
      roomCode = this.generateRoomCode();
      collisionCheck = await GameRoom.findOne({ roomCode });
    }

    const room = new GameRoom({
      roomCode,
      creatorId: new Types.ObjectId(userId),
      maxPlayers: dto.maxPlayers,
      gameMode: dto.gameMode || 'CLASSIC',
      status: 'WAITING',
      players: [
        {
          userId: user._id,
          name: user.name,
          avatar: user.avatar || '',
          isReady: true,
          isBot: false,
          joinedAt: new Date(),
        },
      ],
      turnTimeoutSeconds: 30,
    });

    await room.save();
    return room;
  }

  /**
   * Join an existing game room by its 6-character code
   */
  async joinRoom(userId: string, roomCode: string): Promise<IGameRoom> {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const room = await GameRoom.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room) {
      throw ApiError.notFound(`Game room with code ${roomCode} not found`);
    }

    if (room.status !== 'WAITING') {
      throw ApiError.badRequest('Game has already started or ended');
    }

    const isAlreadyInRoom = room.players.some((p) => p.userId.toString() === userId);
    if (isAlreadyInRoom) {
      return room;
    }

    if (room.players.length >= room.maxPlayers) {
      throw ApiError.badRequest(`Room is full (Maximum ${room.maxPlayers} players allowed)`);
    }

    room.players.push({
      userId: user._id,
      name: user.name,
      avatar: user.avatar || '',
      isReady: true,
      joinedAt: new Date(),
    });

    // Auto-start when room is completely filled
    if (room.players.length === room.maxPlayers) {
      await this.initializeAndStartGame(room);
    } else {
      await room.save();
    }

    return room;
  }

  /**
   * Manually start game by creator (e.g. for 2 players in a 4-player room)
   */
  async startGame(userId: string, roomCode: string): Promise<IGameRoom> {
    const room = await GameRoom.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room) {
      throw ApiError.notFound('Game room not found');
    }

    if (room.creatorId.toString() !== userId) {
      throw ApiError.forbidden('Only the room creator can start the game');
    }

    if (room.status !== 'WAITING') {
      throw ApiError.badRequest('Game is not in WAITING state');
    }

    if (room.players.length < 2) {
      throw ApiError.badRequest('At least 2 players are required to start a game');
    }

    await this.initializeAndStartGame(room);
    return room;
  }

  /**
   * Internal helper initializing engine state and persisting to room
   */
  private async initializeAndStartGame(room: IGameRoom): Promise<void> {
    const playersData = room.players.map((p) => ({
      userId: p.userId.toString(),
      name: p.name,
      isBot: p.isBot || false,
    }));

    const gameState = LudoEngine.createGame(
      room.roomCode,
      playersData,
      room.gameMode || 'CLASSIC'
    );

    // Assign assigned colors back to room players
    room.players.forEach((p) => {
      const match = gameState.players.find((gp) => gp.userId === p.userId.toString());
      if (match) {
        p.color = match.color;
      }
    });

    room.status = 'PLAYING';
    room.gameState = gameState;
    room.turnDeadline = new Date(Date.now() + room.turnTimeoutSeconds * 1000);

    room.markModified('gameState');
    room.markModified('players');
    await room.save();
  }

  /**
   * Roll dice for the active turn
   */
  async rollDice(
    userId: string,
    roomCode: string
  ): Promise<{ rollResult: RollResult; gameState: LudoGameState }> {
    const room = await GameRoom.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room) {
      throw ApiError.notFound('Game room not found');
    }

    if (room.status !== 'PLAYING' || !room.gameState) {
      throw ApiError.badRequest('Game is not currently active');
    }

    const rollResult = LudoEngine.rollDice(room.gameState, userId);

    room.turnDeadline = new Date(Date.now() + room.turnTimeoutSeconds * 1000);
    room.markModified('gameState');
    await room.save();

    return {
      rollResult,
      gameState: room.gameState,
    };
  }

  /**
   * Move a designated token using currently rolled dice
   */
  async moveToken(
    userId: string,
    roomCode: string,
    tokenId: number
  ): Promise<{ moveResult: MoveResult; gameState: LudoGameState }> {
    const room = await GameRoom.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room) {
      throw ApiError.notFound('Game room not found');
    }

    if (room.status !== 'PLAYING' || !room.gameState) {
      throw ApiError.badRequest('Game is not currently active');
    }

    const moveResult = LudoEngine.moveToken(room.gameState, userId, tokenId);

    if (moveResult.gameFinished) {
      room.status = 'FINISHED';
      if (room.gameState.winners.length > 0) {
        room.winnerUserId = new Types.ObjectId(room.gameState.winners[0].userId);
      }
    }

    room.turnDeadline = new Date(Date.now() + room.turnTimeoutSeconds * 1000);
    room.markModified('gameState');
    await room.save();

    return {
      moveResult,
      gameState: room.gameState,
    };
  }

  /**
   * Get full state of a game room
   */
  async getGameState(userId: string, roomCode: string): Promise<IGameRoom> {
    const room = await GameRoom.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room) {
      throw ApiError.notFound('Game room not found');
    }

    return room;
  }

  /**
   * Leave a game room (handling waiting vs playing states)
   */
  async leaveRoom(userId: string, roomCode: string): Promise<{ message: string }> {
    const room = await GameRoom.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room) {
      throw ApiError.notFound('Game room not found');
    }

    if (room.status === 'WAITING') {
      room.players = room.players.filter((p) => p.userId.toString() !== userId);

      if (room.players.length === 0) {
        await room.deleteOne();
        return { message: 'Room was empty and has been removed' };
      }

      // If creator leaves, reassign creator to next joined player
      if (room.creatorId.toString() === userId) {
        room.creatorId = room.players[0].userId;
      }

      await room.save();
      return { message: 'Successfully left the room' };
    }

    if (room.status === 'PLAYING') {
      // In active game, forfeit player
      if (room.gameState) {
        const player = room.gameState.players.find((p) => p.userId === userId);
        if (player && !player.hasFinished) {
          player.hasFinished = true;
          // If current turn was of this leaving player, pass turn
          if (room.gameState.players[room.gameState.currentTurnIndex].userId === userId) {
            LudoEngine.advanceTurn(room.gameState);
          }

          // Check if remaining active players is <= 1
          const active = room.gameState.players.filter((p) => !p.hasFinished);
          if (active.length <= 1) {
            room.status = 'FINISHED';
            if (active.length === 1) {
              room.winnerUserId = new Types.ObjectId(active[0].userId);
            }
          }

          room.markModified('gameState');
          await room.save();
        }
      }
      return { message: 'You have forfeited and left the match' };
    }

    return { message: 'Left room' };
  }
}

export const ludoService = new LudoService();
