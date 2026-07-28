/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();
  public isConnected = false;

  connect(token: string) {
    if (this.socket) return;
    
    // In production, you would use import.meta.env.VITE_API_URL or relative path
    const url = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    this.socket = io(url, {
      auth: { token }
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.emit('status', { connected: true });
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.emit('status', { connected: false });
    });

    this.socket.on('imap:status', (data) => {
      this.emit('imap:status', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    const arr = this.listeners.get(event);
    if (arr) {
      this.listeners.set(event, arr.filter(cb => cb !== callback));
    }
  }

  private emit(event: string, data: any) {
    const arr = this.listeners.get(event);
    if (arr) {
      arr.forEach(cb => cb(data));
    }
  }
}

export const webSocketService = new WebSocketService();
