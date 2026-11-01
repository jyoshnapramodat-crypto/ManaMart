import { io } from 'socket.io-client';

// Use environment variable or default to port 5050 / current origin
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (window.location.port === '5173' ? 'http://localhost:5050' : window.location.origin);

// Singleton socket instance to prevent reconnect churn during Vite Hot Module Reloading (HMR)
if (!window.__manamart_socket) {
  window.__manamart_socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 4000,
    timeout: 5000,
    transports: ['websocket', 'polling'],
  });

  window.__manamart_socket.on('connect', () => {
    console.log('⚡ Socket connected to ManaMart real-time engine:', window.__manamart_socket.id);
  });

  window.__manamart_socket.on('connect_error', () => {
    // Non-blocking fallback: socket will auto-retry in the background without UI lag
  });

  window.__manamart_socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      // Reconnect manually if server disconnected
      window.__manamart_socket.connect();
    }
  });
}

export const socket = window.__manamart_socket;
export default socket;
