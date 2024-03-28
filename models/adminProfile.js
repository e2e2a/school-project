var mongoose = require("mongoose");

var schema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    firstname: {
        type: String
    },
    middlename: {
        type: String
    },
    lastname: {
        type: String
    },
    contact: {
        type: String
    },
    birthMonth: {
        type: String
    },
    birthDay: {
        type: String
    },
    birthYear: {
        type: String
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },

}, {
    versionKey: false,
    timestamps: true
}
); 

module.exports = mongoose.model('AdminProfile', schema, 'AdminProfile');