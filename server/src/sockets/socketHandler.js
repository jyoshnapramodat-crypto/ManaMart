export function initializeSockets(io) {
  io.on('connection', (socket) => {
    console.log(`⚡ Socket client connected: ${socket.id}`);

    // Join room for order tracking
    socket.on('join:order', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`Socket ${socket.id} joined order room: order:${orderId}`);
    });

    // Rider sends GPS location ping
    socket.on('rider:location_update', ({ orderId, lat, lng }) => {
      io.to(`order:${orderId}`).emit('order:rider_moved', { lat, lng, timestamp: Date.now() });
    });

    // Merchant updates preparation stage
    socket.on('order:status_update', ({ orderId, status, note }) => {
      io.to(`order:${orderId}`).emit('order:status_changed', { status, note, timestamp: Date.now() });
    });

    socket.on('disconnect', (reason) => {
      // Clean disconnect log
      if (process.env.NODE_ENV === 'development' && reason !== 'transport close') {
        console.log(`Socket disconnected: ${socket.id} (${reason})`);
      }
    });
  });
}

