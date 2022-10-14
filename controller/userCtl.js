const User = require('../model/user');
const catchAsync = require('../util/catchAsync');




exports.createUser = catchAsync(async(req, res, next) => {
    const user = await User.create(req.body);

    res.status(200).json({
        message: 'success',
        data: {
            user
        }
    })
});


exports.getAllUsers = catchAsync( async(req, res, next) => {
    const users = await User.find().select('-__v');


    res.status(200).json({
        message: 'success',
        size: users.length,
        data: {
            users
        }
    })
});

exports.getOrderForUser = catchAsync(async(req, res,next) => {
    const user = await User.findById(req.params.id).populate('orders');

    res.status(200).json({
        message: 'success',
        data: {
            user
        }
    })
});



