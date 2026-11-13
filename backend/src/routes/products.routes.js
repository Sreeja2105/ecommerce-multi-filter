const { Router } = require('express');
const { listProducts, getMeta } = require('../controllers/products.controller');

const router = Router();

router.get('/meta', getMeta);
router.get('/', listProducts);

module.exports = router;
