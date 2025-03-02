const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const authMiddleWare = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/create', offerController.createPost);
router.put('/edit/:id', offerController.editMyGigs);
router.get('/me/all', offerController.getMyGigs);
router.get('/all/:id?', offerController.getallOffers);
router.get('/admin/:id/:search?', [authMiddleWare,admin], offerController.adminSideGigs);
router.get('/category/:catId/:id?', offerController.catgoryBaseOffers);
router.delete('/:id', offerController.deleteMyOffer);
router.put('/like/:id', offerController.likePost);
router.put('/update/:status/:id', offerController.UpdateStatusBYcontractor);
router.get('/fav/me/:id?', offerController.getMyFavPosts);
router.delete('/admin/:id',[authMiddleWare, admin], offerController.deleteOffer);

module.exports = router;
