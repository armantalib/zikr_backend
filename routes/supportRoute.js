const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');

router.post('/create', supportController.create);
router.get('/admin/:id/:search?', [auth, admin], supportController.getAdminnotifications);
router.put('/attended/:id', [auth, admin], supportController.attendTheSupport);

module.exports = router;
