const router = require('express').Router();
const c = require('../controllers/productController');

router.get('/', c.list);
router.get('/:slug', c.getBySlug);

module.exports = router;
