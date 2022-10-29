const express = require('express');

const productCtl = require('../controller/productCtl');
const auth = require('../controller/auth.Ctl');
const router = express.Router();
const authCtl = require('../controller/auth.Ctl');



router.route('/')
    .get(auth.protect, auth.restrictTo('admin', 'user'), productCtl.getAllProducts)
    .post(authCtl.protect, authCtl.restrictTo('admin'), productCtl.createProduct);

router.route('/:id')
    .get(productCtl.getProduct)
    .patch(authCtl.protect, authCtl.restrictTo('admin'), productCtl.updateProduct)
    .delete(authCtl.protect, authCtl.restrictTo('admin'),productCtl.deleteProduct)

module.exports = router;