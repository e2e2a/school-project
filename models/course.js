var mongoose = require("mongoose");

var schema = mongoose.Schema({
    name: {
        type: String
    },
    category: {
        type: String
    },
    description: {
        type: String
    },
}, {
    versionKey: false,
    timestamps: true
}
); 

module.exports = mongoose.model('Course', schema, 'Course');