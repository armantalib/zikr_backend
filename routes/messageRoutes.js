const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const admin = require('../middleware/admin');

router.post('/send', messageController.sendMessage);
router.get('/conversations/:id?', messageController.getUserConversations);
router.get('/messages/:userId/:id?', messageController.getMessages);
router.get('/admin/conversations/:id', admin, messageController.adminSideGigs);
router.get('/admin/messages/:conversationsId/:id', admin, messageController.adminSideMessage);
router.put('/seen/:userId', messageController.allSeen);
router.get('/new-msg/:userId/:id', messageController.newMessage);
router.delete('/messages/:id',admin, messageController.deleteMessages);
router.delete('/conversations/:id',admin, messageController.deleteConversation);

module.exports = router;
