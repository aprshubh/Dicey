import { Server } from 'socket.io';
import { AppSocket } from '../../shared/socket/socket.types';
import { ludoService } from './ludo.service';
import { LudoEngine } from './engine/ludo.engine';
import { LudoBot } from './engine/ludo.bot';
import { GameRoom } from './ludo.model';
import { Account } from '../auth/auth.model';
import { Friendship, getCanonicalPair } from '../friends/friends.model';
import { matchmakingService } from './matchmaking/matchmaking.service';
import { logger } from '../../shared/utils/logger';

// In-memory active turn timers per room
const activeTurnTimers = new Map<string, NodeJS.Timeout>();
const TURN_TIMEOUT_SECONDS = 20;

/**
 * Checks if current active player is an AI Bot and automatically executes their turn
 */
export const checkAndExecuteBotTurn = async (io: Server, roomCode: string): Promise<boolean> => {
  const room = await GameRoom.findOne({ roomCode: roomCode.toUpperCase() });
  if (!room || room.status !== 'PLAYING' || !room.gameState) {
    return false;
  }

  const gameState = room.gameState;
  const currentPlayer = gameState.players[gameState.currentTurnIndex];

  if (!currentPlayer.isBot) {
    return false;
  }

  logger.info(`🤖 Executing Bot turn for [${currentPlayer.name}] in room [${roomCode}]`);

  // Natural human delay before rolling (1.2 seconds)
  setTimeout(async () => {
    try {
      const liveRoom = await GameRoom.findOne({ roomCode: roomCode.toUpperCase() });
      if (!liveRoom || liveRoom.status !== 'PLAYING' || !liveRoom.gameState) return;

      const liveState = liveRoom.gameState;
      const botPlayer = liveState.players[liveState.currentTurnIndex];

      if (!botPlayer.isBot) return;

      // 1. Bot rolls dice
      const rollResult = LudoEngine.rollDice(liveState, botPlayer.userId);

      io.to(roomCode).emit('dice_rolled', {
        userId: botPlayer.userId,
        rollResult,
        gameState: liveState,
      });

      if (rollResult.turnPassed || rollResult.validMoves.length === 0) {
        liveRoom.markModified('gameState');
        await liveRoom.save();
        startTurnTimer(io, roomCode);
        return;
      }

      // 2. Natural human delay before selecting best token (800ms)
      setTimeout(async () => {
        try {
          const moveRoom = await GameRoom.findOne({ roomCode: roomCode.toUpperCase() });
          if (!moveRoom || moveRoom.status !== 'PLAYING' || !moveRoom.gameState) return;

          const moveState = moveRoom.gameState;
          const activeBot = moveState.players[moveState.currentTurnIndex];

          const bestTokenId = LudoBot.selectBestMove(moveState, activeBot, rollResult.validMoves);
          const moveResult = LudoEngine.moveToken(moveState, activeBot.userId, bestTokenId);

          io.to(roomCode).emit('token_moved', {
            userId: activeBot.userId,
            moveResult,
            gameState: moveState,
          });

          if (moveResult.gameFinished) {
            moveRoom.status = 'FINISHED';
            clearTurnTimer(roomCode);
            io.to(roomCode).emit('game_finished', {
              winners: moveState.winners,
              gameState: moveState,
            });
          }

          moveRoom.markModified('gameState');
          await moveRoom.save();

          if (!moveResult.gameFinished) {
            startTurnTimer(io, roomCode);
          }
        } catch (err) {
          logger.error('Error executing bot token move:', err);
        }
      }, 800);
    } catch (err) {
      logger.error('Error executing bot roll:', err);
    }
  }, 1200);

  return true;
};

/**
 * Starts a 20-second turn timer for the current active player
 * Or delegates to Bot execution if player is an AI Bot
 */
export const startTurnTimer = (io: Server, roomCode: string): void => {
  clearTurnTimer(roomCode);

  // Check if current turn belongs to a Bot
  checkAndExecuteBotTurn(io, roomCode).then((isBot) => {
    if (isBot) {
      return; // Bot turn scheduled; no need for human AFK timer
    }

    // Set human AFK 20s countdown
    const timer = setTimeout(async () => {
      try {
        const room = await GameRoom.findOne({ roomCode: roomCode.toUpperCase() });
        if (!room || room.status !== 'PLAYING' || !room.gameState) return;

        const gameState = room.gameState;
        const currentPlayer = gameState.players[gameState.currentTurnIndex];

        if (!gameState.hasRolledDice) {
          const rollResult = LudoEngine.rollDice(gameState, currentPlayer.userId);

          if (rollResult.turnPassed || rollResult.validMoves.length === 0) {
            room.markModified('gameState');
            await room.save();

            io.to(roomCode).emit('turn_timeout', {
              userId: currentPlayer.userId,
              message: `${currentPlayer.name} timed out. Auto-rolled ${rollResult.diceValue}, no moves available. Turn passed.`,
              gameState,
            });

            startTurnTimer(io, roomCode);
            return;
          }

          const autoTokenId = rollResult.validMoves[0];
          const moveResult = LudoEngine.moveToken(gameState, currentPlayer.userId, autoTokenId);

          if (moveResult.gameFinished) {
            room.status = 'FINISHED';
            clearTurnTimer(roomCode);
            io.to(roomCode).emit('game_finished', {
              winners: gameState.winners,
              gameState,
            });
          }

          room.markModified('gameState');
          await room.save();

          io.to(roomCode).emit('turn_timeout', {
            userId: currentPlayer.userId,
            message: `${currentPlayer.name} timed out. Auto-played token ${autoTokenId}.`,
            gameState,
          });

          if (!moveResult.gameFinished) {
            startTurnTimer(io, roomCode);
          }
        } else {
          if (gameState.validMoveTokenIds.length > 0) {
            const autoTokenId = gameState.validMoveTokenIds[0];
            const moveResult = LudoEngine.moveToken(gameState, currentPlayer.userId, autoTokenId);

            if (moveResult.gameFinished) {
              room.status = 'FINISHED';
              clearTurnTimer(roomCode);
              io.to(roomCode).emit('game_finished', {
                winners: gameState.winners,
                gameState,
              });
            }

            room.markModified('gameState');
            await room.save();

            io.to(roomCode).emit('turn_timeout', {
              userId: currentPlayer.userId,
              message: `${currentPlayer.name} timed out choosing token. Auto-played token ${autoTokenId}.`,
              gameState,
            });

            if (!moveResult.gameFinished) {
              startTurnTimer(io, roomCode);
            }
          } else {
            LudoEngine.advanceTurn(gameState);
            room.markModified('gameState');
            await room.save();

            io.to(roomCode).emit('turn_timeout', {
              userId: currentPlayer.userId,
              message: `${currentPlayer.name} timed out. Turn passed.`,
              gameState,
            });

            startTurnTimer(io, roomCode);
          }
        }
      } catch (err) {
        logger.error(`Error in turn timeout for room ${roomCode}:`, err);
      }
    }, TURN_TIMEOUT_SECONDS * 1000);

    activeTurnTimers.set(roomCode, timer);
  });
};

export const clearTurnTimer = (roomCode: string): void => {
  const existingTimer = activeTurnTimers.get(roomCode);
  if (existingTimer) {
    clearTimeout(existingTimer);
    activeTurnTimers.delete(roomCode);
  }
};

/**
 * Registers all Ludo real-time game socket events
 */
export const registerLudoSocketHandlers = (io: Server, socket: AppSocket): void => {
  const user = socket.data.user;

  // 1. Join Room (Private Play with Friends)
  socket.on('join_room', async ({ roomCode }) => {
    try {
      const code = roomCode.toUpperCase();
      socket.join(code);
      socket.data.currentRoom = code;

      const room = await GameRoom.findOne({ roomCode: code });
      if (!room) {
        socket.emit('error_event', { message: 'Game room not found' });
        return;
      }

      logger.info(`🎮 User ${user.name} joined room channel [${code}]`);

      io.to(code).emit('player_joined', {
        userId: user.id,
        name: user.name || 'Player',
        totalPlayers: room.players.length,
      });

      if (room.status === 'PLAYING' && room.gameState) {
        socket.emit('game_started', { gameState: room.gameState });
      }
    } catch (err) {
      socket.emit('error_event', { message: (err as Error).message });
    }
  });

  // 2. Start Game (Creator triggers)
  socket.on('start_game', async ({ roomCode }) => {
    try {
      const code = roomCode.toUpperCase();
      const room = await ludoService.startGame(user.id, code);

      if (room.gameState) {
        io.to(code).emit('game_started', { gameState: room.gameState });
        startTurnTimer(io, code);
      }
    } catch (err) {
      socket.emit('error_event', { message: (err as Error).message });
    }
  });

  // 3. Roll Dice
  socket.on('roll_dice', async ({ roomCode }) => {
    try {
      const code = roomCode.toUpperCase();
      const result = await ludoService.rollDice(user.id, code);

      io.to(code).emit('dice_rolled', {
        userId: user.id,
        rollResult: result.rollResult,
        gameState: result.gameState,
      });

      startTurnTimer(io, code);
    } catch (err) {
      socket.emit('error_event', { message: (err as Error).message });
    }
  });

  // 4. Move Token
  socket.on('move_token', async ({ roomCode, tokenId }) => {
    try {
      const code = roomCode.toUpperCase();
      const result = await ludoService.moveToken(user.id, code, tokenId);

      io.to(code).emit('token_moved', {
        userId: user.id,
        moveResult: result.moveResult,
        gameState: result.gameState,
      });

      if (result.moveResult.gameFinished) {
        clearTurnTimer(code);
        io.to(code).emit('game_finished', {
          winners: result.gameState.winners,
          gameState: result.gameState,
        });
      } else {
        startTurnTimer(io, code);
      }
    } catch (err) {
      socket.emit('error_event', { message: (err as Error).message });
    }
  });

  // 5. In-Game Emojis & Quick Chat
  socket.on('send_emoji', ({ roomCode, emoji }) => {
    const code = roomCode.toUpperCase();
    io.to(code).emit('emoji_received', {
      userId: user.id,
      name: user.name || 'Player',
      emoji,
    });
  });

  // 6. Leave Room
  socket.on('leave_room', async ({ roomCode }) => {
    try {
      const code = roomCode.toUpperCase();
      socket.leave(code);
      await ludoService.leaveRoom(user.id, code);

      io.to(code).emit('player_left', {
        userId: user.id,
        name: user.name || 'Player',
      });
    } catch (err) {
      socket.emit('error_event', { message: (err as Error).message });
    }
  });

  // 7. Random Matchmaking: Enter Queue
  socket.on('find_match', async ({ maxPlayers }) => {
    try {
      const result = await matchmakingService.addToQueue(
        {
          userId: user.id,
          socketId: socket.id,
          name: user.name || 'Player',
          maxPlayers,
          queuedAt: new Date(),
        },
        io,
        (roomCode) => {
          startTurnTimer(io, roomCode);
        }
      );

      socket.emit('matchmaking_searching', {
        maxPlayers,
        queueSize: result.queueSize,
      });
    } catch (err) {
      socket.emit('error_event', { message: (err as Error).message });
    }
  });

  // 8. Random Matchmaking: Cancel Search
  socket.on('cancel_matchmaking', () => {
    matchmakingService.removeFromQueue(user.id);
    socket.emit('matchmaking_cancelled');
  });

  // 9. Live Friend Match Invite: Send Invite
  socket.on('invite_friend', async ({ friendId, roomCode }) => {
    try {
      const code = roomCode.toUpperCase();
      const room = await GameRoom.findOne({ roomCode: code });
      if (!room) {
        socket.emit('error_event', { message: 'Game room not found' });
        return;
      }

      // Check if caller is in the room
      const isInRoom = room.players.some((p) => p.userId.toString() === user.id);
      if (!isInRoom) {
        socket.emit('error_event', { message: 'You must be in the room to invite friends' });
        return;
      }

      // Verify Friendship
      const { userA, userB } = getCanonicalPair(user.id, friendId);
      const friendship = await Friendship.findOne({ userA, userB, status: 'accepted' });
      if (!friendship) {
        socket.emit('error_event', { message: 'You can only invite accepted friends' });
        return;
      }

      // Locate target friend's active socket(s)
      let friendSocketFound = false;
      for (const [, clientSocket] of io.sockets.sockets) {
        if (clientSocket.data.user?.id === friendId) {
          friendSocketFound = true;
          clientSocket.emit('game_invite_received', {
            fromUserId: user.id,
            fromName: user.name || 'Friend',
            fromAvatar: user.avatar,
            roomCode: code,
            maxPlayers: room.maxPlayers,
            gameMode: room.gameMode,
          });
        }
      }

      if (!friendSocketFound) {
        socket.emit('error_event', { message: 'Friend is currently offline' });
      }
    } catch (err) {
      socket.emit('error_event', { message: (err as Error).message });
    }
  });

  // 10. Live Friend Match Invite: Decline Invite
  socket.on('decline_invite', ({ roomCode, fromUserId }) => {
    for (const [, clientSocket] of io.sockets.sockets) {
      if (clientSocket.data.user?.id === fromUserId) {
        clientSocket.emit('invite_declined', {
          byUserId: user.id,
          byName: user.name || 'Friend',
          roomCode,
        });
      }
    }
  });

  // 11. Socket Disconnect
  socket.on('disconnect', async () => {
    logger.info(`🔌 Socket disconnected: ${user.name} (${user.id})`);

    matchmakingService.removeFromQueue(user.id);

    await Account.findOneAndUpdate(
      { userId: user.id },
      { $set: { isOnline: false, lastActive: new Date() } }
    );

    if (socket.data.currentRoom) {
      io.to(socket.data.currentRoom).emit('player_left', {
        userId: user.id,
        name: user.name || 'Player',
      });
    }
  });
};
