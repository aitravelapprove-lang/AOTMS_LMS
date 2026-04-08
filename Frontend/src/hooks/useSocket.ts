import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

// Determine the base URL for the socket connection
const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  return apiUrl.replace('/api', '');
};

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: any[];
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  notifications: [],
  clearNotifications: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session } = useAuth();
  const token = session?.access_token;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // 1. Requirement check: User must be logged in
    if (!user || !token) {
      if (socket) {
        console.log('[Socket] Disconnecting (User logged out)');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // 2. Prevent duplicate connection if already connected/connecting with same token
    if (socket?.connected) {
        return;
    }

    // 3. Initialize Socket
    const socketUrl = getSocketUrl();
    if (!socketUrl) {
       console.warn('[Socket] No socket URL determined. Skipping connection.');
       return;
    }

    console.log(`[Socket] Connecting to ${socketUrl}...`);

    try {
      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // 4. Event Listeners
      newSocket.on('connect', () => {
        console.log('[Socket] Connected:', newSocket.id);
        setIsConnected(true);
        newSocket.emit('authenticate', user.id); 
      });

      newSocket.on('notification', (notif: any) => {
          setNotifications(prev => [notif, ...prev]);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (err) => {
        // Suppress benign connection errors in development if backend is restarting
        if (err.message === 'xhr poll error') return; 
        console.warn('[Socket] Connection Error:', err.message);
        setIsConnected(false);
      });

      setSocket(newSocket);

      // 5. Cleanup on unmount or dependency change
      return () => {
        console.log('[Socket] Cleaning up...');
        newSocket.off('connect');
        newSocket.off('disconnect');
        newSocket.off('connect_error');
        newSocket.off('notification');
        newSocket.disconnect();
      };
    } catch (error) {
       console.error('[Socket] Failed to initialize socket:', error);
    }
  }, [user?.id, token]); 

  const clearNotifications = () => {
      setNotifications([]);
  };

  // Use React.createElement to avoid JSX syntax in a .ts file
  return React.createElement(
    SocketContext.Provider,
    { value: { socket, isConnected, notifications, clearNotifications } },
    children
  );
};
