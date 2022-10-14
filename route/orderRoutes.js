const express = require('express');
const orderCtl = require('../controller/orderCtl');
const authCtl = require('../controller/auth.Ctl');

const router = express.Router();


router.route('/')
    .post(authCtl.isUserLoggedIn, orderCtl.createOrder)
    .get(orderCtl.getAllOrders)
    .delete(orderCtl.deleteAll);

router.get('/forUser', authCtl.protect, orderCtl.getAllOrdersforUser);

router.route('/:id')
    .patch(orderCtl.editOrder);


module.exports = router;