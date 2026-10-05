import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '../config/env.config';
import { socketAuthMiddleware } from './socket.auth';
import { registerLudoSocketHandlers } from '../../features/ludo/ludo.socket';
import { logger } from '../utils/logger';
import { AppSocket } from './socket.types';

let ioInstance: SocketIOServer | null = null;

export const initSocketServer = (httpServer: http.Server): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  // 1. Authentication Middleware
  io.use((socket, next) => {
    socketAuthMiddleware(socket, next);
  });

  // 2. Connection Handler
  io.on('connection', (socket) => {
    registerLudoSocketHandlers(io, socket as unknown as AppSocket);
  });

  ioInstance = io;
  logger.info('⚡ Real-time Socket.IO server initialized successfully');

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!ioInstance) {
    throw new Error('Socket.IO server has not been initialized');
  }
  return ioInstance;
};
