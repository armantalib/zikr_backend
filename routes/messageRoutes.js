const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');


router.post('/send',auth, messageController.sendMessage);
router.get('/conversations/:id?',auth,messageController.getUserConversations);
router.get('/messages/:userId/:id?',auth, messageController.getMessages);
router.get('/admin/conversations/:id',auth,admin, messageController.adminSideGigs);
router.get('/admin/messages/:conversationsId/:id',auth,admin, messageController.adminSideMessage);
router.put('/seen/:userId',auth, messageController.allSeen);
router.get('/new-msg/:userId/:id',auth, messageController.newMessage);
router.delete('/messages/:id',auth,admin, messageController.deleteMessages);
router.delete('/conversations/:id',auth,admin, messageController.deleteConversation);

module.exports = router;
