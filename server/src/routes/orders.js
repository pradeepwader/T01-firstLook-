const router = require('express').Router();
const c = require('../controllers/orderController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/checkout', c.checkoutRules, validate, c.checkout);
router.get('/my', c.myOrders);
router.get('/:orderId/status', c.status);
router.post('/:orderId/mock-pay', c.mockPay);

module.exports = router;
