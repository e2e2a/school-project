var mongoose = require("mongoose");

var schema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    },
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
    },
    // this is an optional
    ULI: {
        type: String
    },
    entryDate: {
        type: String
    },
    // end
    firstname: {
        type: String
    },
    middlename: {
        type: String
    },
    lastname: {
        type: String
    },
    numberStreet: {
        type: String
    },
    barangay: {
        type: String
    },
    district: {
        type: String
    },
    cityMunicipality: {
        type: String
    },
    province: {
        type: String
    },
    region: {
        type: String
    },
    emailFbAcc: {
        type: String
    },
    contact: {
        type: String
    },
    nationality: {
        type: String
    },
    sex: {
        type: String
    },
    civilStatus: {
        type: String
    },
    employmentStatus: {
        type: String
    },
    birthMonth: {
        type: String
    },
    birthDay: {
        type: String
    },
    birthYear: {
        type: String
    },
    age: {
        type: String
    },
    birthPlaceCity: {
        type: String
    },
    birthPlaceProvince: {
        type: String
    },
    birthPlaceRegion: {
        type: String
    },
    educationAttainment: {
        type: String
    },
    learnerOrTraineeOrStudentClassification: {
        type: String
    },
    takenNcaeOrYp4sc: {
        type: String
    },
    year: {
        type: String
    },
    semester: {
        type: String
    },
    isEnrolled: { 
        type: Boolean, 
        default: false 
    },
    isEnrolling: { 
        type: Boolean, 
        default: false 
    },
    isStudying: { 
        type: Boolean, 
        default: false 
    },
    printLimit: { 
        type: Number, 
        default: 0 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },

}, {
    versionKey: false,
    timestamps: true
}
); 

module.exports = mongoose.model('StudentProfile', schema, 'StudentProfile');