const { promisify } = require('util');
const User = require('../model/user');
const catchAsync = require('../util/catchAsync');
const jwt = require('jsonwebtoken');
const ApiError = require('../util/ApiError');

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn:  process.env.JWT_EXPIRES_IN
    });
}


exports.protect = catchAsync(async(req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
   if(!token) return next(new ApiError('No token'));

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const freshUser = await User.findById(decoded.id);

    if(!freshUser) return next(new ApiError('User do not exists anymore'));

    if(freshUser.passwordWasChanged(decoded.iat)) return next(new ApiError('password was changed after the token was emited'));

    req.user = freshUser;

    next();
});

exports.isUserLoggedIn = (async(req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
   if(!token) return next();

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const freshUser = await User.findById(decoded.id);

    if(!freshUser) return next();

    if(freshUser.passwordWasChanged(decoded.iat)) return next();

    req.user = freshUser;

    next();
});

exports.restrictTo = (...roles) =>{
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) return next(new ApiError(`You don't have permission for this`));
        next();
    }
}

exports.signup = catchAsync(async(req, res, next) => {
    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        passwordConfirmed: req.body.passwordConfirmed,
        email: req.body.email,
        firstname: req.body.email,
        lastname: req.body.lastname,
        role: req.body.role,
        address: req.body.address,
        phone: req.body.phone,
        passwordChangedAt: req.body.passwordChangedAt
    });

    const token = signToken(user._id);

    res.status(201).json({
        message: 'success',
        token,
        data: {
            user
        }
    })
});

exports.signin = catchAsync(async(req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password) return next(new ApiError('No email or password received'));

    const user = await User.findOne({email}).select('+password');
    
    if(!user || !(await user.correctPassword(password, user.password))) return next(new ApiError('Email or password are not valid'));

    const token = signToken(user._id);

    res.status(201).json({
        message: 'success',
        data: {
            token
        }
    });
});

exports.forgotPassword = catchAsync(async(req, res, next) => {
    const user = await User.findOne({email: req.body.email});

    if(!user) return next(new ApiError('There is no user with this email'));

    const token = user.generateResetToken();

    await user.save({validateBeforeSave: false});

})