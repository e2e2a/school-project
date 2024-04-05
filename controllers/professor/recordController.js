const User = require('../../models/user')
const ProfessorProfile = require('../../models/professorProfile');
const Course = require('../../models/course');
const ProfessorScheduleHistory = require('../../models/professorScheduleHistory')
const mongoose = require('mongoose');
const SITE_TITLE = 'DSF';


module.exports.professorRecord = async (req, res) => {
    const professorProfile = await ProfessorProfile.findOne({ userId: req.session.login });
    const histories = await ProfessorScheduleHistory.find({ professorId: professorProfile._id }).populate('professorId');
    const coursesSidebar = await Course.find();
    res.render('professor/record', {
        site_title: SITE_TITLE,
        title: 'Professors Schedule',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        professorProfile: professorProfile,
        histories: histories,
        coursesSidebar: coursesSidebar,
    });
}