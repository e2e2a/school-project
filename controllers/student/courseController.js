const User = require('../../models/user')
const StudentProfile = require('../../models/studentProfile');
const Course = require('../../models/course');
const mongoose = require('mongoose');
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        if (userLogin) {
            if (userLogin.role === 'student') {
                const studentProfile = await StudentProfile.findOne({ userId: userLogin._id });
                if (studentProfile) {
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
                        return res.redirect('/profile')
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

module.exports.enroll = async (req, res) => {
    //double check if user is already enrolled
    try {
        const userLogin = await User.findById(req.session.login);
        if (userLogin) {
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
        } else {
            return res.redirect('/login')
        }
    } catch (error) {
        console.log('error:', error)
        return res.status(500).render('500');
    }
}