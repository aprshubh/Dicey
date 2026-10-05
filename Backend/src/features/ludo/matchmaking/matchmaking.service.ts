import crypto from 'crypto';
import { Types } from 'mongoose';
import { Server } from 'socket.io';
import { QueueTicket } from './matchmaking.types';
import { GameRoom } from '../ludo.model';
import { LudoEngine } from '../engine/ludo.engine';
import { logger } from '../../../shared/utils/logger';
import { IGameRoom } from '../ludo.interface';

// 15 seconds wait before spawning AI bot opponents
const BOT_FALLBACK_TIMEOUT_MS = 15000;

const BOT_NAMES = ['Bot Alex', 'Bot Rahul', 'Bot Priya', 'Bot Vikram', 'Bot Zara'];

class MatchmakingService {
  private queue2P = new Map<string, QueueTicket>();
  private queue4P = new Map<string, QueueTicket>();
  private botTimers = new Map<string, NodeJS.Timeout>();

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(crypto.randomInt(0, chars.length));
    }
    return code;
  }

  /**
   * Adds a player to the selected matchmaking queue (2P or 4P)
   * With automatic 15-second AI Bot fallback
   */
  async addToQueue(
    ticket: QueueTicket,
    io: Server,
    onGameStarted: (roomCode: string) => void
  ): Promise<{ queueSize: number }> {
    // Remove player from any previous queue & cancel previous bot timer
    this.removeFromQueue(ticket.userId);

    const queue = ticket.maxPlayers === 2 ? this.queue2P : this.queue4P;
    queue.set(ticket.userId, ticket);

    logger.info(`🔍 Player ${ticket.name} (${ticket.userId}) joined ${ticket.maxPlayers}P matchmaking queue. Current queue size: ${queue.size}`);

    // Check if enough real human players exist to form a match immediately
    if (queue.size >= ticket.maxPlayers) {
      await this.formMatch(ticket.maxPlayers, io, onGameStarted);
      return { queueSize: 0 };
    }

    // Set 15s timer: If no human joins, fill with AI Bots!
    const timer = setTimeout(async () => {
      if (queue.has(ticket.userId)) {
        logger.info(`🤖 Matchmaking timeout (15s) for ${ticket.name}. Spawning AI Bot opponent(s)!`);
        await this.formMatchWithBots(ticket, io, onGameStarted);
      }
    }, BOT_FALLBACK_TIMEOUT_MS);

    this.botTimers.set(ticket.userId, timer);

    return { queueSize: queue.size };
  }

  /**
   * Removes a player from all matchmaking queues and cancels bot timer
   */
  removeFromQueue(userId: string): boolean {
    const timer = this.botTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      this.botTimers.delete(userId);
    }

    const removedFrom2P = this.queue2P.delete(userId);
    const removedFrom4P = this.queue4P.delete(userId);
    const wasRemoved = removedFrom2P || removedFrom4P;

    if (wasRemoved) {
      logger.info(`🚫 Player ${userId} left the matchmaking queue.`);
    }

    return wasRemoved;
  }

  /**
   * Returns current queue status for a player
   */
  isInQueue(userId: string): boolean {
    return this.queue2P.has(userId) || this.queue4P.has(userId);
  }

  /**
   * Forms a match with available queued players
   */
  private async formMatch(
    maxPlayers: 2 | 4,
    io: Server,
    onGameStarted: (roomCode: string) => void
  ): Promise<IGameRoom | null> {
    const queue = maxPlayers === 2 ? this.queue2P : this.queue4P;

    if (queue.size < maxPlayers) {
      return null;
    }

    // Extract first N players
    const matchedTickets: QueueTicket[] = [];
    for (const ticket of queue.values()) {
      matchedTickets.push(ticket);
      this.removeFromQueue(ticket.userId);
      if (matchedTickets.length === maxPlayers) {
        break;
      }
    }

    return this.createAndStartMatch(matchedTickets, maxPlayers, io, onGameStarted);
  }

  /**
   * Forms a match by filling remaining slots with AI Bots
   */
  private async formMatchWithBots(
    humanTicket: QueueTicket,
    io: Server,
    onGameStarted: (roomCode: string) => void
  ): Promise<IGameRoom | null> {
    const queue = humanTicket.maxPlayers === 2 ? this.queue2P : this.queue4P;
    if (!queue.has(humanTicket.userId)) {
      return null;
    }

    const matchedTickets: (QueueTicket & { isBot?: boolean })[] = [humanTicket];
    this.removeFromQueue(humanTicket.userId);

    // If another human is also in queue, grab them
    for (const ticket of queue.values()) {
      if (matchedTickets.length < humanTicket.maxPlayers) {
        matchedTickets.push(ticket);
        this.removeFromQueue(ticket.userId);
      }
    }

    // Fill the rest with Bots
    let botIndex = 0;
    while (matchedTickets.length < humanTicket.maxPlayers) {
      const botName = BOT_NAMES[botIndex % BOT_NAMES.length];
      matchedTickets.push({
        userId: `bot_${crypto.randomBytes(4).toString('hex')}`,
        socketId: 'bot_socket_virtual',
        name: botName,
        maxPlayers: humanTicket.maxPlayers,
        isBot: true,
        queuedAt: new Date(),
      });
      botIndex++;
    }

    return this.createAndStartMatch(matchedTickets, humanTicket.maxPlayers, io, onGameStarted);
  }

  /**
   * Core helper to initialize DB GameRoom and Socket communication
   */
  private async createAndStartMatch(
    matchedTickets: (QueueTicket & { isBot?: boolean })[],
    maxPlayers: 2 | 4,
    io: Server,
    onGameStarted: (roomCode: string) => void
  ): Promise<IGameRoom> {
    logger.info(`🎉 Match created! Pairing ${matchedTickets.map((t) => t.name).join(' vs ')} (${maxPlayers}P)`);

    // Generate unique room code
    let roomCode = this.generateRoomCode();
    let collision = await GameRoom.findOne({ roomCode });
    while (collision) {
      roomCode = this.generateRoomCode();
      collision = await GameRoom.findOne({ roomCode });
    }

    // Initialize Game Engine state
    const playersData = matchedTickets.map((t) => ({
      userId: t.userId,
      name: t.name,
      isBot: t.isBot || false,
    }));

    const gameState = LudoEngine.createGame(roomCode, playersData, 'CLASSIC');

    // Create DB Room Players
    const roomPlayers = matchedTickets.map((t) => {
      const assignedColor = gameState.players.find((p) => p.userId === t.userId)?.color;
      const isRealUser = !t.isBot;

      return {
        userId: isRealUser ? new Types.ObjectId(t.userId) : new Types.ObjectId(),
        name: t.name,
        avatar: t.avatar || '',
        color: assignedColor,
        isReady: true,
        isBot: t.isBot || false,
        joinedAt: new Date(),
      };
    });

    const humanCreator = matchedTickets.find((t) => !t.isBot) || matchedTickets[0];

    const room = new GameRoom({
      roomCode,
      creatorId: new Types.ObjectId(humanCreator.userId),
      maxPlayers,
      gameMode: 'CLASSIC',
      status: 'PLAYING',
      players: roomPlayers,
      gameState,
      turnTimeoutSeconds: 20,
      turnDeadline: new Date(Date.now() + 20 * 1000),
    });

    await room.save();

    // Connect real human sockets to the room channel and notify them
    matchedTickets.forEach((ticket) => {
      if (!ticket.isBot) {
        let playerSocket = io.sockets.sockets.get(ticket.socketId);
        if (!playerSocket) {
          for (const [, s] of io.sockets.sockets) {
            if (s.data?.user?.id === ticket.userId) {
              playerSocket = s;
              break;
            }
          }
        }
        if (playerSocket) {
          playerSocket.join(roomCode);
          playerSocket.data.currentRoom = roomCode;

          const playerColor = gameState.players.find((p) => p.userId === ticket.userId)?.color || 'RED';

          playerSocket.emit('match_found', {
            roomCode,
            color: playerColor,
            gameState,
          });
        } else {
          logger.warn(`⚠️ Could not find live socket for player ${ticket.name} (${ticket.userId})`);
        }
      }
    });

    // Notify room channel that game has started
    io.to(roomCode).emit('game_started', { gameState });

    // Trigger turn timer
    onGameStarted(roomCode);

    return room;
  }
}

export const matchmakingService = new MatchmakingService();
