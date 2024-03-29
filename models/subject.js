var mongoose = require("mongoose");

var schema = mongoose.Schema({
    //use courseId easy to find the section
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    subjectCode: { 
        type: String
    },
    name: { 
        type: String
    },
    unit: { 
        type: String
    },
    //remove this
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
    description: { 
        type: String
    },
}, {
    versionKey: false,
    timestamps: true
}
); 

module.exports = mongoose.model('Subject', schema, 'Subject');