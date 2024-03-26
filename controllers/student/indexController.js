const User = require('../../models/user')
const StudentProfile = require('../../models/studentProfile')
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        if (userLogin) {
            if (userLogin.role === 'student') {
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