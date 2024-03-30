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
    subjects: [{
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
        // #1
        professorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProfessorProfile'
        },
        startTime: {
            type: String,
        },
        endTime: {
            type: String,
        },
        grade: {
            type: Number,
        },
    }],
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