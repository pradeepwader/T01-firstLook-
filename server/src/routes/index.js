const router = require('express').Router();

router.get('/health', (req, res) => res.json({ status: 'OK', time: new Date().toISOString() }));
router.use('/auth', require('./auth'));
router.use('/products', require('./products'));
router.use('/content', require('./content'));
router.use('/orders', require('./orders'));
router.use('/library', require('./library'));
router.use('/admin', require('./admin'));
// NOTE: /api/payments/webhook is mounted in app.js (needs the raw body)

module.exports = router;
