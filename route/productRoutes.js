const express = require('express');
const productCtl = require('../controller/productCtl');
const auth = require('../controller/auth.Ctl');
const router = express.Router();



router.route('/')
    .get(auth.protect, auth.restrictTo('admin', 'user'), productCtl.getAllProducts)
    .post(productCtl.createProduct);

router.route('/:id')
    .get(productCtl.getProduct)
    .patch(productCtl.updateProduct)
    .delete(productCtl.deleteProduct)

module.exports = router;