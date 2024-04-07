const User = require('../models/user');
const studentProfile = require('../models/studentProfile');
const ProfessorProfile = require('../models/professorProfile');

async function isAuthenticated(req, res, next) {
    if (req.session.login) {
        next();
    } else {
        return res.redirect('/');
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

async function isProfessorProfileVerified(req, res, next) {
    await isProfessor(req, res, async () => {
        const professor = await ProfessorProfile.findOne({userId: req.session.login});
        if (professor && professor.isVerified) {
            next();
        } else {
            req.flash('message', 'Update your profile to begin the class.');
            return res.redirect('/professor/profile')
        }
    });
}

module.exports = {
    isAuthenticated,
    isAdmin,
    isProfessor,
    isStudent,
    isStudentProfileVerified,
    isProfessorProfileVerified
};