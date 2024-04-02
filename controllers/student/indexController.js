const User = require('../../models/user')
const StudentProfile = require('../../models/studentProfile')
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    const studentProfile = await StudentProfile.findOne({ userId: userLogin._id });
    if (studentProfile) {
        if (studentProfile.isVerified) {
            res.render('user/index', {
                site_title: SITE_TITLE,
                title: 'Home',
                messages: req.flash(),
                currentUrl: req.originalUrl,
                userLogin: userLogin,
                req: req,
                studentProfile: studentProfile,
            });
        } else {
            req.flash('message', 'Update your profile to begin the enrollment.');
            return res.redirect('/profile')
        }
    } else {
        return res.redirect('/register');
    }
}