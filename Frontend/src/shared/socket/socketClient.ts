import { io, Socket } from 'socket.io-client';
import { tokenStorage } from '../utils/tokenStorage';

const getSocketUrl = (): string => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (typeof window !== 'undefined') {
    if (window.location.port !== '5173') {
      return window.location.origin;
    }
  }
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

class SocketService {
  private socket: Socket | null = null;
  private isConnecting = false;

  public connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const token = tokenStorage.getAccessToken();

    if (this.socket) {
      // Disconnect and update token
      this.socket.disconnect();
    }

    this.isConnecting = true;

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token || '',
      },
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.isConnecting = false;
      console.log('⚡ Connected to Dicey WebSocket server! Socket ID:', this.socket?.id);
    });

    this.socket.on('connect_error', (err) => {
      this.isConnecting = false;
      console.warn('WebSocket connection warning:', err.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket:', reason);
    });

    return this.socket;
  }

  public getSocket(): Socket | null {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
    }
  }

  public reconnectWithToken(token: string): Socket {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
    return this.socket;
  }
}

export const socketService = new SocketService();
