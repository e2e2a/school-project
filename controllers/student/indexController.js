const User = require('../../models/user')
const StudentProfile = require('../../models/studentProfile')
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    const studentProfile = await StudentProfile.findOne({ userId: userLogin._id });
    res.render('user/index', {
        site_title: SITE_TITLE,
        title: 'Home',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        userLogin: userLogin,
        req: req,
        studentProfile: studentProfile,
    });
}