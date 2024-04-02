var mongoose = require("mongoose");

var schema = mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentProfile'
    },
    // #2
    studentName: {
        lastname: {
            type: String,
        },
        firstname: {
            type: String,
        },
        middlename: {
            type: String,
        }
    },
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
        professorName: {
            lastname: {
                type: String,
            },
            firstname: {
                type: String,
            },
            middlename: {
                type: String,
            }
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