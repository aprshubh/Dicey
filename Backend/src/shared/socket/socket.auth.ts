import { Socket } from 'socket.io';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.util';
import { User, Account } from '../../features/auth/auth.model';
import { logger } from '../utils/logger';
import { AuthenticatedSocketUser } from './socket.types';

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> => {
  try {
    let token = socket.handshake.auth?.token as string | undefined;

    // Fallback: Authorization header
    if (!token && socket.handshake.headers.authorization) {
      const parts = socket.handshake.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    // Fallback: Handshake query
    if (!token && socket.handshake.query?.token) {
      token = socket.handshake.query.token as string;
    }

    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }

    const decoded = verifyAccessToken(token) as TokenPayload;

    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    const socketUser: AuthenticatedSocketUser = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    socket.data.user = socketUser;

    // Mark user as online in Account collection
    await Account.findOneAndUpdate(
      { userId: user._id },
      { $set: { isOnline: true, lastActive: new Date() } }
    );

    logger.info(`🔌 Socket authenticated: ${user.name} (${user.email}) - SocketID: ${socket.id}`);
    next();
  } catch (error) {
    logger.warn(`❌ Socket auth rejected: ${(error as Error).message}`);
    next(new Error('Authentication error: Invalid or expired token'));
  }
};
