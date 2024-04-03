const User = require('../../models/user')
const StudentProfile = require('../../models/studentProfile');
const Course = require('../../models/course');
const mongoose = require('mongoose');
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    const studentProfile = await StudentProfile.findOne({ userId: userLogin._id });
    if (studentProfile.isVerified) {
        const courses = await Course.find()
        res.render('user/courses', {
            site_title: SITE_TITLE,
            title: 'Courses',
            messages: req.flash(),
            currentUrl: req.originalUrl,
            userLogin: userLogin,
            req: req,
            studentProfile: studentProfile,
            courses: courses,
        });
    } else {
        req.flash('message', 'Update your profile to begin the enrollment.');
        return res.redirect('/profile');
    }
}

module.exports.enroll = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    const courseId = req.body.courseId;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        console.log('Invalid courseId:', courseId);
        return res.status(404).render('404');
    }
    const course = await Course.findById(courseId);
    if (course) {
        const studentProfile = await StudentProfile.findOne({ userId: userLogin._id })
        if (studentProfile.isEnrolled) {
            console.log('student is already enrolled and making request to enroll')
            return res.redirect('/courses');
        }
        await StudentProfile.findOneAndUpdate({ userId: userLogin._id }, { courseId: course._id, isEnrolling: true }, { new: true })
        console.log('enrollment pending success');
        return res.redirect('/courses');
    } else {
        console.log('no course found to be enrolled.')
        return res.redirect('/courses')
    }
}