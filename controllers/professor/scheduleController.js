const User = require('../../models/user')
const StudentProfile = require('../../models/studentProfile');
const ProfessorProfile = require('../../models/professorProfile');
const Course = require('../../models/course');
const StudentClass = require('../../models/studentClass');
const Section = require('../../models/section');
const Schedule = require('../../models/schedule');
const SITE_TITLE = 'DSF';


module.exports.schedule = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    const professorProfile = await ProfessorProfile.findOne({ userId: userLogin._id });
    const schedule = await Schedule.findOne({ professorId: professorProfile._id }).populate('schedule.subjectId');
    res.render('professor/schedule', {
        site_title: SITE_TITLE,
        title: 'Schedule',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        userLogin: userLogin,
        req: req,
        professorProfile: professorProfile,
        schedule: schedule,
    });
}