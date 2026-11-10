import { io } from 'socket.io-client';

// Determine backend socket server URL dynamically
const getSocketUrl = () => {
    if (process.env.REACT_APP_SOCKET_URL) {
        return process.env.REACT_APP_SOCKET_URL;
    }
    if (process.env.REACT_APP_BACKEND_URL) {
        return process.env.REACT_APP_BACKEND_URL;
    }
    // On localhost, fallback to backend port 4000
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:4000';
    }
    // On production/custom domain, connect to current origin
    return window.location.origin;
};

export const socket = io(getSocketUrl(), {
    autoConnect: true,
    transports: ['websocket', 'polling'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
});

socket.on('connect', () => {
    console.log('[Socket.IO Real-Time Client]: Connected to server with ID:', socket.id);
});

socket.on('disconnect', (reason) => {
    console.log('[Socket.IO Real-Time Client]: Disconnected:', reason);
});

socket.on('connect_error', (error) => {
    console.warn('[Socket.IO Real-Time Client]: Connection attempt warning (will retry automatically):', error.message);
});

export default socket;
