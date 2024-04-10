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
    //after end semester
    courseName: {
        type: String,
    },
    category: {
        type: String
    },
    year: {
        type: String,
    },
    semester: {
        type: String,
    },
    section: {
        type: String,
    },
    batch: {
        type: String,
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
        grade: {
            type: Number,
        },
    }],
    type: {
        type: String,
    },
    //if true show subjects if false show continue studying
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