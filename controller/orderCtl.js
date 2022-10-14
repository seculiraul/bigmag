const Order = require('../model/order');
const Product = require('../model/product');
const catchAsync = require('../util/catchAsync');



exports.createOrder = catchAsync( async(req, res, next) => {

    let order;
    if(req.user) {
    order = await Order.create({
        address: req.body.address ?? req.user.address,
        phone: req.body.phone ?? req.user.phone,
        items: req.body.items,
    });
    req.user.orders.push(order);
    await req.user.save({validateBeforeSave: false})
} else {
    order = await Order.create({
        address: req.body.address,
        phone: req.body.phone,
        items: req.body.items,
    });
}
    res.status(201).json({
        message: 'success',
        data: {
            order
        }
    });
});

exports.deleteAll = async(req, res, next) => {
    const orders = await Order.find();
    await orders.map(order => order._id).forEach(async id => await Order.findByIdAndDelete(id));

    res.status(204).json({
        message: 'success'
    });
}


exports.getAllOrders = catchAsync( async(req, res, next) => {
    const orders = await Order.find();

    res.status(200).json({
        message: 'success',
        length: orders.length,
        data: {
            orders
        }
    });
});


exports.getAllOrdersforUser = catchAsync(async(req, res, next) => {
    const orders = await req.user.populate('orders');

    res.status(200).json({
        message: 'succes',
        data: {
            orders
        }
    });
});


exports.editOrder = catchAsync(async(req, res, next) => {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {runValidators: true, new: true});

    res.status(200).json({
        message: 'success',
        data: {
            order
        }
    })
});