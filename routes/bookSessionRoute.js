const express = require('express');
const router = express.Router();
const bookSession = require('../controllers/bookSession');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');


router.post('/create',auth, bookSession.create);
router.get('/slots/:userId/:date',auth, bookSession.getSlotsData);
router.get('/tutor/:status/:date?',auth, bookSession.getAllSessionTrainer);
router.get('/student/:status/:date?',auth, bookSession.getAllSessionStudent);
router.put('/update/:status/:id',auth, bookSession.updateBookSession);
router.get('/admin/all/:id?/:status?/:type?/:date?',[auth,admin], bookSession.getAllSessionAdmin);


// router.get('/buyer/:status/:id?', applicationController.getAllEmployeeApplication);
// router.get('/seller/:status/:id?', applicationController.getAllSellerApplication);
// router.put('/seen/:id', applicationController.UpdateOrder);
// router.put('/seller/seen', applicationController.UpdateSellerOrder);
// router.put('/buyer/seen', applicationController.UpdateBuyerOrder);
// router.put('/update/:status/:id', applicationController.UpdateStatusBYcontractor);
// router.get('/admin/:id/:type?', admin, applicationController.adminSideGigs);
// router.put('/submit/:id', applicationController.submitWork);
// router.delete('/:id',admin, applicationController.deleteorders);

module.exports = router;
