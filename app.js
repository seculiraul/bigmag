const express = require('express');

const productsRouter = require('./route/productRoutes');
const orderRouter = require('./route/orderRoutes');
const userRouter = require('./route/userRoutes');
const app = express();

app.use(express.json());

app.use('/api/v1/products', productsRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/orders', orderRouter);

app.use((err, req, res, next) => {

    err.statusCode = err.statusCode ?? 500;
    err.message = err.message ?? 'Someting went wrong';
    err.status = err.status ?? 'error';
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    })
}) 


module.exports = app;