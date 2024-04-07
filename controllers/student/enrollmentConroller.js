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

/**
 * @todo delete enroll
 */
module.exports.enroll = async (req, res) => {
    //double check if user is already enrolled
    try {
        const userLogin = await User.findById(req.session.login);
        if (userLogin) {
            const courseId = req.body.courseId;
            if (!mongoose.Types.ObjectId.isValid(courseId)) {
                console.log('Invalid courseId:', courseId);
                return res.status(404).render('404', { role: 'student' });
            }
            const course = await Course.findById(courseId);
            if (course) {
                const studentProfile = await StudentProfile.findOne({ userId: userLogin._id })
                if (studentProfile.isEnrolled) {
                    console.log('student is already enrolled and making request to enroll')
                    return res.redirect('/courses');
                }
                await StudentProfile.findOneAndUpdate({ userId: userLogin._id }, { courseId: course._id }, { new: true })
                console.log('enrollment pending success');
                return res.redirect('/courses');
            } else {
                console.log('no course found to be enrolled.')
                return res.redirect('/courses')
            }
        } else {
            return res.redirect('/login')
        }
    } catch (error) {
        console.log('error:', error)
        return res.status(500).render('500');
    }
}

/**
 * @todo change Section to prospectus
 */
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