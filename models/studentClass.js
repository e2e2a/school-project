var mongoose = require("mongoose");

var schema = mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentProfile'
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
    },
    status: { 
        type: Boolean, 
        default: false 
    },
}, {
    versionKey: false,
    timestamps: true
}
); 

module.exports = mongoose.model('StudentClass', schema, 'StudentClass');