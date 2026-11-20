const router = require('express').Router();
const admin = require('../controllers/adminController');
const products = require('../controllers/productController');
const content = require('../controllers/contentController');
const { protect, authorize } = require('../middleware/auth');
const { uploadProductFiles } = require('../middleware/upload');

router.use(protect, authorize('admin'));

router.get('/stats', admin.stats);

router.get('/users', admin.users);
router.put('/users/:id/toggle-status', admin.toggleUser);

router.get('/orders', admin.orders);
router.post('/orders/:orderId/verify', admin.verifyOrder);

router.get('/products', products.adminList);
router.post('/products', uploadProductFiles, products.create);
router.put('/products/:id', uploadProductFiles, products.update);
router.delete('/products/:id', products.remove);

router.put('/content/:key', content.update);

module.exports = router;
