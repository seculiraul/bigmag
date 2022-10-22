const User = require('../model/user');
const ApiError = require('../util/ApiError');
const catchAsync = require('../util/catchAsync');


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj
}

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

exports.updateMe = catchAsync(async(req, res, next) => {
    //1 Create error if user post password
    if(req.body.password || req.body.password) return next(new ApiError('This route is not for password updates', 400));

    //3 Filter body
    const filterdBody = filterObj(req.body, 'firstname', 'lastname', 'phone', 'address');

    //3 Update user document
    const updatedUser = await User
        .findByIdAndUpdate(req.user._id, filterdBody, {new: true, runValidators: true})
        .select('-passwordChangedAt -__v');

    res.status(200).json({
        status: 'Success',
        data: {
            user: updatedUser
        }
    });
})



