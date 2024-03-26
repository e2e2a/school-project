var mongoose = require("mongoose");

var schema = mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    semester: { 
        type: String
    },
    year: { 
        type: String
    },
    section: { 
        type: String
    },
    subjects: [{
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
        professorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
    }], 
    status: { 
        type: Boolean, 
        default: false ,
    },
}, {
    versionKey: false,
    timestamps: true
}
); 

module.exports = mongoose.model('Section', schema, 'Section');