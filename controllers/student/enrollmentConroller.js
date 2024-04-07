const User = require('../../models/user')
const StudentProfile = require('../../models/studentProfile');
const Course = require('../../models/course');
const StudentClass = require('../../models/studentClass');
const Section = require('../../models/section');
const mongoose = require('mongoose');
const Prospectus = require('../../models/prospectus');
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    const studentProfile = await StudentProfile.findOne({ userId: userLogin._id });
    const studentClass = await StudentClass.findOne({ studentId: studentProfile._id }).populate('subjects.subjectId').populate('subjects.professorId');

    const renderData = {
        site_title: SITE_TITLE,
        title: 'Subjects',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        userLogin,
        req,
        studentProfile,
        studentClass,
    };

    if (studentClass) {
        renderData.studentSection = await Section.findById(studentClass._id).populate('subjects.subjectId').populate('courseId').populate('subjects.professorId');
    }

    res.render('user/subjects', renderData);
}

module.exports.prospectus = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    const studentProfile = await StudentProfile.findOne({ userId: userLogin._id });
    if (studentProfile.isVerified) {
        const studentProspectus = await Prospectus.find({ studentId: studentProfile._id });
        res.render('user/prospectus', {
            site_title: SITE_TITLE,
            title: 'Prospectus',
            messages: req.flash(),
            currentUrl: req.originalUrl,
            userLogin: userLogin,
            req: req,
            studentProfile: studentProfile,
            studentProspectus: studentProspectus,
        });
    } else {
        req.flash('message', 'Update your profile to begin the enrollment.');
        return res.redirect('/profile')
    }
}