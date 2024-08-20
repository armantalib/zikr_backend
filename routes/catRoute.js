const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');

router.post('/create', [auth, admin], categoriesController.create);
router.get('/admin/:id/:search?', [auth, admin], categoriesController.getAllCategories);
router.put('/edit/:id', [auth, admin], categoriesController.editCategories);
router.put('/:status/:id', [auth, admin], categoriesController.deactivateCategries);
router.get('/all/:id?', categoriesController.getAllCustomerCategories);
router.delete('/:id',[auth, admin], categoriesController.deleteCatrgoires);
// router.get('/destination/:name', categoriesController.getDestinationCategories);

module.exports = router;
