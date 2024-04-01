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
    // #2
    courseName: {
        type: String,
    },
    // #2
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
}, {
    versionKey: false,
    timestamps: true
}
);

module.exports = mongoose.model('Prospectus', schema, 'Prospectus');