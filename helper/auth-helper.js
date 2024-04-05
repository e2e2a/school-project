const User = require('../models/user');
const studentProfile = require('../models/studentProfile');

async function isAuthenticated(req, res, next) {
    if (req.session.login) {
        next();
    } else {
        return res.redirect('/login');
    }
}

async function isAdmin(req, res, next) {
    await isAuthenticated(req, res, async () => {
        const user = await User.findById(req.session.login);
        if (user && user.role === 'admin') {
            next();
        } else {
            return res.status(404).render('404', {role: user.role});
        }
    });
}

async function isProfessor(req, res, next) {
    await isAuthenticated(req, res, async () => {
        const user = await User.findById(req.session.login);
        if (user && user.role === 'professor') {
            next();
        } else {
            return res.status(404).render('404', {role: user.role});
        }
    });
}

async function isStudent(req, res, next) {
    await isAuthenticated(req, res, async () => {
        const user = await User.findById(req.session.login);
        if (user && user.role === 'student') {
            next();
        } else {
            return res.status(404).render('404', {role: user.role});
        }
    });
}
async function isStudentProfileVerified(req, res, next) {
    await isStudent(req, res, async () => {
        const student = await studentProfile.findOne({userId: req.session.login});
        if (student && student.isVerified) {
            next();
        } else {
            req.flash('message', 'Update your profile to begin the enrollment.');
            return res.redirect('/profile')
        }
    });
}

module.exports = {
    isAuthenticated,
    isAdmin,
    isProfessor,
    isStudent,
    isStudentProfileVerified
};