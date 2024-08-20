const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const admin = require('../middleware/admin');

router.get('/all/:id?', notificationController.getApplicationDetails);
router.get('/check-seen', notificationController.checkSeen);
router.put('/seen', notificationController.allSeen);
router.delete('/:id', notificationController.deleteNoti);
router.delete('/admin/:id',admin, notificationController.deletenotification);

module.exports = router;
