import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket(userId: number | undefined) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Create socket connection if it doesn't exist
    if (!socket) {
      socket = io({
        path: '/socket.io',
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('[Socket.IO] Connected');
        setIsConnected(true);
        // Join user's personal room
        socket?.emit('join', userId);
      });

      socket.on('disconnect', () => {
        console.log('[Socket.IO] Disconnected');
        setIsConnected(false);
      });

      socket.on('error', (error) => {
        console.error('[Socket.IO] Error:', error);
      });
    }

    return () => {
      // Don't disconnect on unmount, keep connection alive
    };
  }, [userId]);

  return { socket, isConnected };
}

export function getSocket() {
  return socket;
}
