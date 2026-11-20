const router = require('express').Router();
const c = require('../controllers/libraryController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', c.myLibrary);
router.get('/:productId/open', c.open);
router.get('/:productId/download', c.download);

module.exports = router;
