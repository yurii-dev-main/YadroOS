import { useEffect, useState } from 'react';
import { websocketService } from '../services/websocket.service';

interface UseWebSocketOptions<T> {
  channel: string;
  events?: Record<string, (data: T) => void>;
}

export const useWebSocket = <T = unknown>({ channel, events }: UseWebSocketOptions<T>) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = websocketService.connect(channel);
    setIsConnected(true);

    const handlers = Object.entries(events ?? {}).map(([event, handler]) => {
      const wrapped = (data: unknown) => handler(data as T);
      socket.on(event, wrapped);
      return { event, handler: wrapped };
    });

    return () => {
      handlers.forEach(({ event, handler }) => socket.off(event, handler));
      websocketService.disconnect(channel);
      setIsConnected(false);
    };
  }, [channel, events]);

  return { isConnected };
};
