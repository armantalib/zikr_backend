const express = require('express');
const router = express.Router();
const generalController = require('../controllers/GeneralController');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');

router.post('/admin/hajj/create', [auth, admin], generalController.create);
router.put('/admin/hajj/update', [auth, admin], generalController.updateHajjUmrah);
router.delete('/admin/hajj/:id', [auth, admin], generalController.deleteHajjUmrah);
router.get('/admin/hajj/:id/:search?', [auth], generalController.getAllHajjUmrahAdmin);
router.get('/hajj/all/:id?', [auth], generalController.getHajjUmrahApp);

router.post('/admin/dua/create', [auth, admin], generalController.duaCreate);
router.put('/admin/dua/update', [auth, admin], generalController.updateDua);
router.delete('/admin/dua/:id', [auth, admin], generalController.deleteDua);
router.get('/admin/dua/:id/:search?', [auth, admin], generalController.getAllDuaAdmin);
router.get('/dua/all/:id?', [auth], generalController.getDuaApp);

router.post('/dua/fav', [auth], generalController.favDuaCreate);
router.get('/dua/fav/:id?', [auth], generalController.getFavDuaApp);

router.post('/quran/fav', [auth], generalController.favQCreate);
router.get('/quran/fav/:id?', [auth], generalController.getFavQApp);

router.post('/settings', [auth], generalController.settingUpdate);
router.get('/settings', [auth], generalController.getSettings);

router.post('/prayer/status', [auth], generalController.usersPrayers);

router.post('/admin/dailyAyat/create', [auth, admin], generalController.dailyAyatCreate);
router.put('/admin/dailyAyat/update', [auth, admin], generalController.updateDailyAyat);
router.delete('/admin/dailyAyat/:id', [auth, admin], generalController.deleteDailyAyat);
router.get('/admin/dailyAyat/:id/:search?', [auth, admin], generalController.getAllDailyAyatAdmin);
router.get('/dailyAyat/all/:id?', [auth], generalController.getDuaApp);

router.post('/quranPakTime', [auth], generalController.quranPakTimeUpdate);
router.post('/get/prayers', [auth], generalController.getAllPrayers);
router.post('/get/prayers/stats', [auth], generalController.getNamazProgressCal);







// router.put('/edit/:id', [auth, admin], hajjUmrahController.editCategories);

// router.put('/:status/:id', [auth, admin], categoriesController.deactivateCategries);
// router.get('/all/:id?', categoriesController.getAllCustomerCategories);
// router.delete('/:id',[auth, admin], categoriesController.deleteCatrgoires);
// router.get('/destination/:name', categoriesController.getDestinationCategories);

module.exports = router;
