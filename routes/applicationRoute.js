const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const admin = require('../middleware/admin');

router.post('/create', applicationController.create);
router.get('/buyer/:status/:id?', applicationController.getAllEmployeeApplication);
router.get('/seller/:status/:id?', applicationController.getAllSellerApplication);
router.put('/seen/:id', applicationController.UpdateOrder);
router.put('/seller/seen', applicationController.UpdateSellerOrder);
router.put('/buyer/seen', applicationController.UpdateBuyerOrder);
router.put('/update/:status/:id', applicationController.UpdateStatusBYcontractor);
router.get('/admin/:id/:type?', admin, applicationController.adminSideGigs);
router.put('/submit/:id', applicationController.submitWork);
router.delete('/:id',admin, applicationController.deleteorders);

module.exports = router;
