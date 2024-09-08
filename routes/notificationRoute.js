const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');

router.get('/all/:id?',auth, notificationController.getApplicationDetails);
router.get('/check-seen',auth, notificationController.checkSeen);
router.put('/seen',auth, notificationController.allSeen);
router.delete('/:id',auth, notificationController.deleteNoti);
router.delete('/admin/:id',auth,admin, notificationController.deletenotification);

module.exports = router;
