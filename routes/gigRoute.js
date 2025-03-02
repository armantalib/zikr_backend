const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleWare = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const admin = require('../middleware/admin');

router.post('/create', authMiddleWare, postController.createPost);
router.put('/edit/:id', authMiddleWare, postController.editMyGigs);
router.get('/detail/:id', optionalAuth, postController.detailsGigs);
router.get('/user/:userid', optionalAuth, postController.userGigs);
router.get('/me/all', authMiddleWare, postController.getMyGigs);
router.get('/admin/:id/:search?', [authMiddleWare,admin], postController.adminSideGigs);
router.get('/filter/:type/:search?', optionalAuth, postController.searchGigs);
router.get('/fav/me/:id?', authMiddleWare, postController.getMyFavPosts);
// router.get('/all/:id?',authMiddleWare, postController.getAllPosts);
// router.get('/trainings/:training_Id', postController.getUserPosts);
router.put('/like/:id', authMiddleWare, postController.likePost);
router.delete('/:id',authMiddleWare, postController.deleteGig);

module.exports = router;
