const { Server } = require('socket.io');
const Order = require('../model/orderModel');

module.exports = function (server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {

    socket.on('joinOrderRoom', (orderId) => {
      socket.join(orderId);
    });

    // When a message is sent
    socket.on('sendMessage', async ({ orderId, message }) => {
      if (!orderId || !message) return;

      try {
        const order = await Order.findById(orderId);
        if (!order) return;

        const newMessage = { message };

        order.conversation.push(message);
        await order.save();

        io.to(orderId).emit('newMessage', { ...message, orderId });
      } catch (error) {
        console.error('Error handling message:', error.message);
        socket.emit('errorMessage', 'Failed to send message');
      }
    });

    socket.on('disconnect', () => {
    });
  });
};
