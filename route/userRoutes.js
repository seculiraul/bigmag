const userCtl = require('../controller/userCtl');
const authCtl = require('../controller/auth.Ctl');
const express = require('express');

const router = express.Router();

router.post('/signup', authCtl.signup);

router.post('/signin', authCtl.signin);

router.post('/forgotPassword', authCtl.forgotPassword);

router.route('/')
    .post(userCtl.createUser)
    .get(userCtl.getAllUsers);

router.route('/:id').get(userCtl.getOrderForUser);

module.exports = router;