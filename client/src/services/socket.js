import { io } from 'socket.io-client';

// Use environment variable or current window origin / port 5050
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (window.location.port === '5173' ? 'http://localhost:5050' : window.location.origin);

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('⚡ Socket connected to ManaMart real-time engine:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected from ManaMart');
});
