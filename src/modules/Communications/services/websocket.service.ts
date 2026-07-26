import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../../store/authStore';
import { IS_DEMO_MODE } from '../../../services/apiClient';

type EventHandler = (data: unknown) => void;

class FakeSocket {
  private listeners = new Map<string, Set<EventHandler>>();
  private intervalId: number | null = null;

  constructor(private readonly channel: string) {}

  connect() {
    if (this.intervalId) return;
    this.intervalId = window.setInterval(() => {
      this.emit('heartbeat', { channel: this.channel, timestamp: Date.now() });
    }, 5000);
  }

  disconnect() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.listeners.clear();
  }

  on(event: string, handler: EventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(handler);
  }

  off(event: string, handler: EventHandler) {
    this.listeners.get(event)?.delete(handler);
  }

  emit(event: string, data: unknown) {
    this.listeners.get(event)?.forEach((handler) => handler(data));
  }
}

class RealSocket {
  private socket: Socket | null = null;

  constructor(private readonly channel: string) {}

  connect() {
    const token = useAuthStore.getState().tokens?.accessToken;
    if (!token) return;

    if (!this.socket) {
      this.socket = io(
        import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001',
        {
          auth: {
            token
          }
        }
      );

      this.socket.on('connect', () => {
        console.log(`Connected to websocket on channel: ${this.channel}`);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, handler: EventHandler) {
    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  off(event: string, handler: EventHandler) {
    if (this.socket) {
      this.socket.off(event, handler);
    }
  }

  emit(event: string, data: unknown) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

const sockets = new Map<string, FakeSocket | RealSocket>();

export const websocketService = {
  connect(channel: string) {
    if (!sockets.has(channel)) {
      const socket = IS_DEMO_MODE ? new FakeSocket(channel) : new RealSocket(channel);
      sockets.set(channel, socket);
    }
    const socket = sockets.get(channel)!;
    socket.connect();
    return socket;
  },

  disconnect(channel: string) {
    const socket = sockets.get(channel);
    socket?.disconnect();
    sockets.delete(channel);
  }
};
