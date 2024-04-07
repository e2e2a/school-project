const User = require('../../models/user')
const StudentProfile = require('../../models/studentProfile')
const ProfessorProfile = require('../../models/professorProfile')
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    const professorProfile = await ProfessorProfile.findOne({ userId: userLogin._id });
    res.render('professor/index', {
        site_title: SITE_TITLE,
        title: 'Home',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        userLogin: userLogin,
        req: req,
        professorProfile: professorProfile,
    });

}