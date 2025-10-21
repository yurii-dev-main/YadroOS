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

const sockets = new Map<string, FakeSocket>();

export const websocketService = {
  connect(channel: string) {
    if (!sockets.has(channel)) {
      sockets.set(channel, new FakeSocket(channel));
    }
    const socket = sockets.get(channel)!;
    socket.connect();
    return socket;
  },

  disconnect(channel: string) {
    const socket = sockets.get(channel);
    socket?.disconnect();
    sockets.delete(channel);
  },
};
