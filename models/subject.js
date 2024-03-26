var mongoose = require("mongoose");

var schema = mongoose.Schema({
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
    description: { 
        type: String
    },
}, {
    versionKey: false,
    timestamps: true
}
); 

module.exports = mongoose.model('Subject', schema, 'Subject');