var mongoose = require("mongoose");

var schema = mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    category: { 
        type: String
    },
    semester: { 
        type: String
    },
    year: { 
        type: String
    },
    section: { 
        // @todo change to Number
        type: String
    },
    subjects: [{
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
        professorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProfessorProfile'
        },
        days: {
            type: [String],
            default: []
        },
        startTime: {
            type: String,
        },
        endTime: {
            type: String,
        },
    }], 
    description: { 
        type: String
    },
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