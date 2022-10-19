const { promisify } = require('util');
const User = require('../model/user');
const catchAsync = require('../util/catchAsync');
const jwt = require('jsonwebtoken');
const ApiError = require('../util/ApiError');
const sendEmail = require('../util/email');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn:  process.env.JWT_EXPIRES_IN
    });
}


const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
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

    const resetToken = user.generateResetToken();

    await user.save({validateBeforeSave: false});

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`; 

    const message = `Forgot your password? Submit a PATCH request to ${resetURL} otherwaise ignore this message`;

    try{
    
        await sendEmail({
            email: user.email,
            subject: 'Your password reset link is active 10 minutes',
            message
        });
        
        res.status(200).json({
            status: 'Success',
            message: 'Token sent to email'
        });
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        await user.save({validateBeforeSave: false});
        return new ApiError('there was an error', 500);
    }

});

exports.resetPassword = catchAsync( async (req, res, next) => {

    //1 get user base on token
    const hasedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({passwordResetToken: hasedToken,
         passwordResetTokenExpires: {$gt: Date.now()}});
    //2 set new password if token not expired and there is a user

    if(!user) return next(new ApiError('Token is invalid or has expired', 400));

    //3 update changedpasswordAt field
    user.password = req.body.password;
    user.passwordConfirmed = req.body.passwordConfirmed;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    //4 send login token
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    })
});

exports.changePassword = catchAsync(async(req, res, next) => {
    //1 Get user from collection
    if(!req.user) return next(new ApiError('Please login', 400));
    const user = await User.findById(req.user._id).select('+password');
    //2 Is posted password correct
    if(!(await user.correctPassword(req.body.password, user.password))) return next(new ApiError('Password is not correct', 400));
    //3 Update password
    user.password = req.body.newPassword;
    user.passwordConfirmed = req.body.newPasswordConfirmed;
    await user.save();
    
    //4 Log user in
    //createSendToken(user, 200, res);
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    });
});