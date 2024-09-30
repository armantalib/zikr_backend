const express = require('express');
const router = express.Router();
const hajjUmrahController = require('../controllers/HajjUmrahController');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');

router.post('/admin/hajj/create', [auth, admin], hajjUmrahController.create);
router.get('/admin/hajj/:id/:search?', [auth, admin], hajjUmrahController.getAllHajjUmrahAdmin);
router.get('/hajj/all/:id?', [auth], hajjUmrahController.getHajjUmrahApp);

router.post('/admin/dua/create', [auth, admin], hajjUmrahController.duaCreate);
router.get('/admin/dua/:id/:search?', [auth, admin], hajjUmrahController.getAllDuaAdmin);
router.get('/dua/all/:id?', [auth], hajjUmrahController.getDuaApp);

router.post('/dua/fav', [auth], hajjUmrahController.favDuaCreate);
router.get('/dua/fav/:id?', [auth], hajjUmrahController.getFavDuaApp);

router.post('/quran/fav', [auth], hajjUmrahController.favQCreate);
router.get('/quran/fav/:id?', [auth], hajjUmrahController.getFavQApp);





// router.put('/edit/:id', [auth, admin], hajjUmrahController.editCategories);

// router.put('/:status/:id', [auth, admin], categoriesController.deactivateCategries);
// router.get('/all/:id?', categoriesController.getAllCustomerCategories);
// router.delete('/:id',[auth, admin], categoriesController.deleteCatrgoires);
// router.get('/destination/:name', categoriesController.getDestinationCategories);

module.exports = router;
