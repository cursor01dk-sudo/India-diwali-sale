import { io } from 'socket.io-client';

const getSocketUrl = () => {
    if (process.env.REACT_APP_SOCKET_URL) {
        return process.env.REACT_APP_SOCKET_URL;
    }
    if (process.env.REACT_APP_BACKEND_URL) {
        return process.env.REACT_APP_BACKEND_URL;
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:4000';
    }
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
    console.log('[Admin Socket.IO Client]: Connected with ID:', socket.id);
    // Join privileged admin room
    socket.emit('join_admin_room', { role: 'admin' });
});

socket.on('disconnect', (reason) => {
    console.log('[Admin Socket.IO Client]: Disconnected:', reason);
});

export default socket;
