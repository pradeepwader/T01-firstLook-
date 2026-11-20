const router = require('express').Router();
const c = require('../controllers/contentController');

router.get('/:key', c.get);

module.exports = router;
