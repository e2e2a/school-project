const User = require('../models/user');

const authRegisterController = require('../controllers/auth/registerController');
const authVerifyController = require('../controllers/auth/verifyController');
const authLoginController = require('../controllers/auth/loginController');
const authLogoutController = require('../controllers/auth/logoutController');
const authVerifyEditEmailController = require('../controllers/auth/verifyEditEmailController');
const authResetPassword = require('../controllers/auth/resetPassword/verifyForgot_password');

//admin
const adminCourseController = require('../controllers/admin/courseController');
const adminEnrollmentController = require('../controllers/admin/enrollmentController');
const adminSubjectController = require('../controllers/admin/subjectController');
const adminsectionController = require('../controllers/admin/sectionController');
const adminCategoryController = require('../controllers/admin/categoryController');
const adminUserController = require('../controllers/admin/userController');
const adminScheduleController = require('../controllers/admin/scheduleController');
const adminEndSemesterController = require('../controllers/admin/endSemesterController');
//user
const userIndexController = require('../controllers/student/indexController');
const userProfileController = require('../controllers/student/profileController');
const userCourseController = require('../controllers/student/courseController');
const userEnrollmentController = require('../controllers/student/enrollmentConroller');
const userFormPrintController = require('../controllers/student/form-print');

//professor
const professorIndexController = require('../controllers/professor/indexController');
const professorProfileController = require('../controllers/professor/profileController');
const professorScheduleController = require('../controllers/professor/scheduleController');
const professorClassController = require('../controllers/professor/classController');
/**
 * @todo
 * end the semester
 * do prospectus
 * /professor/records
 */
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
            res.status(404).render('404');
        }
    });
}

async function isProfessor(req, res, next) {
    await isAuthenticated(req, res, async () => {
        const user = await User.findById(req.session.login);
        if (user && user.role === 'professor') {
            next();
        } else {
            res.status(404).render('404');
        }
    });
}

async function isStudent(req, res, next) {
    await isAuthenticated(req, res, async () => {
        const user = await User.findById(req.session.login);
        if (user && user.role === 'student') {
            next();
        } else {
            res.status(404).render('404');
        }
    });
}

module.exports = function (app) {
    //auth
    app.get('/login', authLoginController.login);
    app.post('/doLogin', authLoginController.doLogin);
    app.get('/register', authRegisterController.register);
    app.post('/doRegister', authRegisterController.doRegister);
    app.get('/verify', authVerifyController.verify)
    app.post('/verify', authVerifyController.doVerify)
    app.get('/verify/email', authVerifyEditEmailController.verify)
    app.post('/verify/email', authVerifyEditEmailController.doVerify)
    app.get('/logout', authLogoutController.logout);
    //forget_password
    app.get('/email', authResetPassword.index);
    app.post('/email', authResetPassword.email);
    app.get('/email/verify', authResetPassword.verify);
    app.post('/email/verify', authResetPassword.doVerify);
    app.get('/new/password/verify', authResetPassword.newPassword);
    app.post('/new/password/verify', authResetPassword.doNewPassword);





    //user
    app.get('/', isStudent, userIndexController.index);
    app.get('/profile', userProfileController.index);
    app.post('/profile/update', userProfileController.update);
    app.get('/courses', userCourseController.index);
    app.post('/course/enroll', userCourseController.enroll);
    app.get('/enrollment/subjects', userEnrollmentController.index);
    app.get('/enrollment/prospectus', userEnrollmentController.prospectus);
    
    //professor
    app.get('/professor', professorIndexController.index);
    app.get('/professor/profile', professorProfileController.index);
    app.post('/professor/profile', professorProfileController.update);
    app.get('/professor/schedule', professorScheduleController.schedule);
    app.get('/professor/class', professorClassController.index);
    app.post('/professor/class/doGrade', professorClassController.doGrade);

    //admin
    app.get('/admin/courses', isAdmin, adminCourseController.index);
    app.get('/admin/course/add', isAdmin, adminCourseController.create);
    app.post('/admin/course/add', isAdmin, adminCourseController.doCreate);
    app.get('/admin/enrollments/enrolling', isAdmin, adminEnrollmentController.index);
    app.post('/admin/enrollment/doEnroll', isAdmin, adminEnrollmentController.doEnroll);
    app.get('/admin/enrollments/enrolled', isAdmin, adminEnrollmentController.enrolled);
    app.get('/admin/enrollment/student/schedule/:id', isAdmin, adminEnrollmentController.studentScheduleView);
    app.post('/admin/enrollment/enrolled/cancel', isAdmin, adminEnrollmentController.enrolledCancel);
    app.get('/admin/sections', isAdmin, adminsectionController.index);
    app.get('/admin/section/add', isAdmin, adminsectionController.create);
    app.post('/admin/section/add', isAdmin, adminsectionController.doCreate);
    app.get('/admin/subjects', isAdmin, adminSubjectController.index);
    app.get('/admin/subject/add', isAdmin, adminSubjectController.create);
    app.post('/admin/subject/add', isAdmin, adminSubjectController.doCreate);
    app.get('/admin/category', isAdmin, adminCategoryController.index);
    app.post('/admin/category', isAdmin, adminCategoryController.actions);
    /**
     * @todo
     * # add student prospectus
     */
    app.post('/admin/category/endSemester', adminEndSemesterController.endSemester)
    app.get('/admin/professors/schedule', isAdmin, adminScheduleController.professor);
    app.get('/admin/professor/schedule/:id', isAdmin, adminScheduleController.professorView);
    app.get('/admin/professor/classes/:id', isAdmin, adminScheduleController.professorClassesView);
    app.get('/admin/user/student/list', isAdmin, adminUserController.student);
    app.get('/admin/user/professor/list', isAdmin, adminUserController.professor);
    app.get('/admin/user/admin/list', isAdmin, adminUserController.admin);
    app.get('/admin/user/edit/:id/:role', isAdmin, adminUserController.edit);
    app.post('/admin/user/edit/:id/:role', isAdmin, adminUserController.doEdit);
    app.get('/admin/user/add', isAdmin, adminUserController.create);
    app.post('/admin/user/add', isAdmin, adminUserController.doCreate);

    //print enrollment
    app.get('/form', userFormPrintController.index);
    app.post('/form/print', userFormPrintController.print);
}