import http from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { initializeSockets } from './src/sockets/socketHandler.js';
import { initializeRecurringScheduler } from './src/jobs/recurringScheduler.js';

const PORT = process.env.PORT || 5050;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.set('io', io);
initializeSockets(io);

// Start database connection and services
async function startServer() {
  await connectDB();
  initializeRecurringScheduler();

  server.listen(PORT, () => {
    console.log(`🚀 ManaMart (LocalLoop) Backend Server running on http://localhost:${PORT}`);
    console.log(`📡 REST API Endpoints active at: http://localhost:${PORT}/api/v1`);
    console.log(`⚡ Socket.IO real-time engine ready`);
  });
}

startServer();
