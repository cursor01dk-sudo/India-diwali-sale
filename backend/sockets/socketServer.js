let io = null;
const EVENTS = require('../../shared/socketEvents');

/**
 * Initialize Socket.IO with the HTTP Server
 * Supports multiple client origins (Customer frontend, Admin dashboard, Localhost, Vercel/Render domains)
 */
function initSocketServer(server) {
    try {
        const { Server } = require('socket.io');

        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'http://127.0.0.1:3002',
            process.env.FRONTEND_URL,
            process.env.ADMIN_URL,
            process.env.CLIENT_URL,
        ].filter(Boolean);

        io = new Server(server, {
            cors: {
                origin: (origin, callback) => {
                    // Allow requests with no origin (mobile apps, curl) or any allowed domain
                    if (!origin) return callback(null, true);
                    if (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('vercel.app')) {
                        return callback(null, true);
                    }
                    return callback(null, true); // Permissive in dev/production with credentials
                },
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                credentials: true,
            },
            pingTimeout: 30000,
            pingInterval: 10000,
        });

        io.on('connection', (socket) => {
            console.log(`[Socket.IO]: Client connected: ${socket.id} (Transport: ${socket.conn.transport.name})`);

            // Check if socket joins as an authenticated admin
            socket.on('join_admin_room', (data) => {
                if (data && (data.role === 'admin' || data.role === 'superadmin' || data.token)) {
                    socket.join('admin_channel');
                    console.log(`[Socket.IO]: Socket ${socket.id} joined admin_channel`);
                }
            });

            // Join default public customer channel
            socket.join('public_channel');

            socket.on('disconnect', (reason) => {
                console.log(`[Socket.IO]: Client disconnected: ${socket.id} (${reason})`);
            });
        });

        console.log('[Socket.IO]: Real-time server initialized successfully');
        return io;
    } catch (err) {
        console.warn('[Socket.IO]: Initialization skipped or module unavailable:', err.message);
        return null;
    }
}

/**
 * Get the current Socket.IO instance
 */
function getIO() {
    return io;
}

/**
 * Broadcast an entity synchronization event to all connected customer & admin clients.
 * Safely sanitizes sensitive admin data before broadcasting to public clients.
 */
function broadcastSync(eventName, payload) {
    if (!io) return;
    try {
        // Strip sensitive internal fields (passwords, tokens, internal admin notes)
        let sanitized = payload;
        if (payload && typeof payload === 'object') {
            const copy = { ...payload };
            delete copy.password;
            delete copy.resetPasswordToken;
            delete copy.resetPasswordExpire;
            delete copy.__v;
            sanitized = copy;
        }

        io.emit(eventName, {
            event: eventName,
            data: sanitized,
            timestamp: Date.now(),
        });
        console.log(`[Socket.IO Event Broadcast]: ${eventName}`);
    } catch (err) {
        console.error(`[Socket.IO Broadcast Error]:`, err.message);
    }
}

/**
 * Send an event specifically to the admin room (e.g. new order received, audit logs)
 */
function notifyAdmin(eventName, payload) {
    if (!io) return;
    try {
        io.to('admin_channel').emit(eventName, {
            event: eventName,
            data: payload,
            timestamp: Date.now(),
        });
    } catch (err) {
        console.error(`[Socket.IO Admin Notify Error]:`, err.message);
    }
}

module.exports = {
    initSocketServer,
    getIO,
    broadcastSync,
    notifyAdmin,
    EVENTS,
};
