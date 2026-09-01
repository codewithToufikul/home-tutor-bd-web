import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export const getSocket = (token?: string): Socket | null => {
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  const authToken = token || localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
  if (!authToken) {
    return null;
  }

  const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const cleanUrl = socketUrl.replace(/\/api\/v1\/?$/, '');

  if (!socketInstance) {
    socketInstance = io(cleanUrl, {
      auth: { token: authToken },
      extraHeaders: { Authorization: `Bearer ${authToken}` },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Chat Socket Connected:', socketInstance?.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 Chat Socket Disconnected:', reason);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('⚠️ Socket connection error (fallback to REST active):', err.message);
    });
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
