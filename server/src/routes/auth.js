const router = require('express').Router();
const c = require('../controllers/authController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.post('/register', c.registerRules, validate, c.register);
router.post('/login', c.loginRules, validate, c.login);
router.post('/logout', c.logout);
router.post('/forgot-password', c.forgotPassword);
router.put('/reset-password/:token', c.resetPassword);
router.get('/me', protect, c.me);
router.put('/me', protect, c.updateProfile);

module.exports = router;
