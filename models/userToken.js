const mongoose = require('mongoose');

const userTokenSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', required: true 
    },
    token: { 
        type: String, 
        required: true, 
        unique: true 
    },
    emailToChange: {
        type: String,
    },
    verificationCode: {
        type: String,
        required: true,
        unique: true,
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    expirationDate: { 
        type: Date, 
        required: true 
    },
    expirationCodeDate: { 
        type: Date, 
        required: true 
    },
});

const UserToken = mongoose.model('UserToken', userTokenSchema);

module.exports = UserToken;