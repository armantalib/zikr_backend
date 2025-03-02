const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const authMiddleWare = require('../middleware/auth');

router.post('/create', trainingController.create);
router.put('/edit/:id', trainingController.editTraining);
router.get('/school/search/:name?', trainingController.getAllScools);
router.get('/search/:name?', trainingController.getAllTraining);
router.get('/allSearch/:name?/:id?/:schoolId?', trainingController.searchAllTraining);
router.get('/remaining/:schoolId', trainingController.remainingTraining);
router.get('/dashboard', authMiddleWare, trainingController.getDashBoard);
router.post('/filter', trainingController.filterTrainings);
router.get('/suggested/:id?', authMiddleWare, trainingController.suggestedTrainings);
router.get('/universities/:id?', authMiddleWare, trainingController.suggestedUniversities);
router.get('/bussiness/:id?', authMiddleWare, trainingController.bussinessSchools);
router.put('/like/:id', authMiddleWare, trainingController.likePost);
router.get('/checkLike/:id', authMiddleWare, trainingController.checkLike);
router.get('/fav/me/:id?', authMiddleWare, trainingController.getMyFavPosts);

module.exports = router;
