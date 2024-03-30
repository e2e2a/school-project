const User = require('../../models/user')
const StudentProfile = require('../../models/studentProfile');
const ProfessorProfile = require('../../models/professorProfile');
const Course = require('../../models/course');
const StudentClass = require('../../models/studentClass');
const Section = require('../../models/section');
const Schedule = require('../../models/schedule');
const SITE_TITLE = 'DSF';


module.exports.schedule = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        if (userLogin) {
            if (userLogin.role === 'professor') {
                const professorProfile = await ProfessorProfile.findOne({ userId: userLogin._id });
                if (professorProfile) {
                    if (professorProfile.isVerified) {
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
                    } else {
                        req.flash('message', 'Update your profile to begin the enrollment.');
                        return res.redirect('/professor/profile')
                    }
                } else {
                    return res.redirect('/register');
                }
            } else {
                return res.status(400).render('404');
            }
        } else {
            return res.redirect('/login');
        }
    } catch (error) {
        console.log('error:', error)
        return res.status(500).render('500');
    }
}