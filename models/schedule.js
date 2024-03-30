var mongoose = require("mongoose");

var schema = mongoose.Schema({
    professorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProfessorProfile'
    },
    // sectionId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Section'
    // },
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
    status: { 
        type: Boolean, 
        default: false 
    },
}, {
    versionKey: false,
    timestamps: true
}
); 

module.exports = mongoose.model('Schedule', schema, 'Schedule');