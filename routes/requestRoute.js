const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const admin = require('../middleware/admin');

router.post('/create', requestController.create);
router.get('/offer/:offer_id/:id?', requestController.getAllApplication);
router.get('/admin/:id/:search?', admin, requestController.adminSideGigs);
router.delete('/:id',admin, requestController.deleteRequest);

module.exports = router;
