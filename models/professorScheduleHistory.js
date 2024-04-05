var mongoose = require("mongoose");

var schema = mongoose.Schema({
    professorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProfessorProfile'
    },
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
    //need to add batch for professors
    schedule: [{
        subject: {
            subjectCode: { 
                type: String
            },
            name: { 
                type: String
            },
            unit: { 
                type: String
            },
            category: { 
                type: String
            },
            year: { 
                type: String
            },
            semester: { 
                type: String
            },
            section: { 
                type: String
            },
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
    batch: {
        type: String,
    }
}, {
    versionKey: false,
    timestamps: true
}
); 

module.exports = mongoose.model('ProfessorScheduleHistory', schema, 'ProfessorScheduleHistory');