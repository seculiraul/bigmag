const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, 'This username already exist'],
        maxlength: [15, 'The length needs to be 3-15 characters'],
        minlength: [3, 'The length needs to be 3-15 characters'],
        required: [true, 'Username is required']
    },
    password: {
        type: String,
        minlength:[8, 'The password mush have at leat 8 characters'],
        select: false,
        required: [true, 'Password is required']
    },
    passwordConfirmed: {
        type: String,
        required: true,
        validate: {
            // ONLY WORKS WITH CREATE/SAVE
            validator: function(el) {
                return el === this.password;
            }
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    email: {
        type: String,
        required: [true, 'Introduce your email'],
        unique: [true, 'This email exists']
    },
    firstname: {
        type: String,
        required: [true, 'Add your first name']
    },
    lastname: {
        type: String,
        required: [true, 'Add your first name']
    },
    address: Object,
    phone: String,
    role: {
        type: String,
        enum: ['admin', 'manager', 'employee', 'user'],
        default: 'user'
    },
    orders: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Orders'
    }]
})

userSchema.methods.correctPassword = async function(candidatePass, currentPass) {
    return await bcrypt.compare(candidatePass, currentPass);
}

userSchema.methods.passwordWasChanged = function(JWTTimestamp) {
    if(this.passwordChangedAt){
        const passwordChangedAtTimestamp = this.passwordChangedAt.getTime() / 1000;

        return JWTTimestamp < passwordChangedAtTimestamp;
    }
    
    return false;
};

userSchema.methods.generateResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

userSchema.pre('save', async function(next)  {
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirmed = undefined;
    next();
});

module.exports = mongoose.model('User', userSchema);