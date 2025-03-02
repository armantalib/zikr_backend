const config = require('config');
const jwt = require('jsonwebtoken');

// Models
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
// const { sendNotification } = require('../controllers/notificationCreateService');
const { User } = require('../models/user');
const { sendNotification } = require('../controllers/notificationCreateService');

const connectedUsers = {};

module.exports = function (server) {

  const io = require("socket.io")(server)


  io.on('connection', (socket) => {

    // Handle user authentication
    socket.on('authenticate', (token) => {
      try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'))
        const userId = decoded._id;

        connectedUsers[userId] = socket.id;

        // Notify the client about successful authentication
        socket.emit('authenticated', userId);

        // Join user to their unique room (socket.io room)
        socket.join(userId);
      } catch (error) {
        console.error('Authentication failed:', error.message);
        // Handle authentication failure
        socket.emit('authentication_failed', "Invalid token.");
      }
    });

    // Handle private messages
    socket.on('send-message', async ({ recipientId, messageText, type, name }) => {
      try {
        const senderId = Object.keys(connectedUsers).find(
          (key) => connectedUsers[key] === socket.id
        );

        const conversation = await Conversation.findOne({
          participants: { $all: [senderId, recipientId] },
        });

        let conversationId = !conversation ? "" : conversation._id

        if (!conversation) {
          // Create a new conversation if it doesn't exist
          const newConversation = new Conversation({
            participants: [senderId, recipientId],
          });
          conversationId = newConversation._id
          await newConversation.save();
        }

        const newMessage = new Message({
          sender: senderId,
          conversationId: conversationId,
          message: messageText,
          type: type
        });

        const savedMessage = await newMessage.save();

        // Emit the new message to the sender and recipient
        io.to(senderId).emit('send-message', savedMessage);
        io.to(recipientId).emit('send-message', savedMessage);

        const otherUser = await User.findById(recipientId)

        await sendNotification({
          user : senderId,
          to_id : recipientId,
          description :  `@${name} sent you a message: ${messageText}`,
          type :'message',
          title :"New Message",
          fcmtoken :otherUser?.fcmtoken,
          noti: otherUser?.noti
      })

      } catch (error) {
        console.error('Error sending private message:', error.message);
        // Handle error
        socket.emit('send_message_error', error.message);
      }
    });

    // Handle disconnection
    socket.on('seen-msg', async ({ recipientId }) => {
      const senderId = Object.keys(connectedUsers).find(
        (key) => connectedUsers[key] === socket.id
      );
      // Remove user from connected users on disconnection
      await allSeen(senderId, recipientId)
      console.log('seen true')
      io.to(recipientId).emit('seen-msg', { seen: true, recipientId });
    });
    socket.on('disconnect', () => {
      // Remove user from connected users on disconnection
      const userId = Object.keys(connectedUsers).find(
        (key) => connectedUsers[key] === socket.id
      );
      if (userId) {
        delete connectedUsers[userId];
        console.log(`User ${userId} disconnected`);
      }
    });
  });
}

const allSeen = async (senderId, recipientId) => {
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (conversation) {

      const otherId = conversation.participants.filter(id => id.toString() !== senderId)

      await Message.updateMany(
        { conversationId: conversation._id, sender: otherId[0] },
        { $set: { seen: true } }
      );
    }
  } catch (error) {
  }
};