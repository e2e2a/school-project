var mongoose = require("mongoose");

var schema = mongoose.Schema({
    professorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProfessorProfile'
    },
    schedule: [{
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
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
}, {
    versionKey: false,
    timestamps: true
}
); 

module.exports = mongoose.model('Schedule', schema, 'Schedule');