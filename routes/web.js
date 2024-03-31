

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
module.exports = function(app){
    //user
    app.get('/', userIndexController.index);
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
    app.get('/admin/courses', adminCourseController.index);
    app.get('/admin/course/add', adminCourseController.create);
    app.post('/admin/course/add', adminCourseController.doCreate);
    app.get('/admin/enrollments', adminEnrollmentController.index);
    app.post('/admin/enrollment/doEnroll', adminEnrollmentController.doEnroll);
    app.get('/admin/sections', adminsectionController.index);
    app.get('/admin/section/add', adminsectionController.create);
    app.post('/admin/section/add', adminsectionController.doCreate);
    app.get('/admin/subjects', adminSubjectController.index);
    app.get('/admin/subject/add', adminSubjectController.create);
    app.post('/admin/subject/add', adminSubjectController.doCreate);
    app.get('/admin/category', adminCategoryController.index);
    app.post('/admin/category', adminCategoryController.actions);


    //users
    app.get('/admin/user/student/list', adminUserController.student);
    app.get('/admin/user/professor/list', adminUserController.professor);
    app.get('/admin/user/admin/list', adminUserController.admin);
    app.get('/admin/user/edit/:id/:role', adminUserController.edit);
    app.post('/admin/user/edit/:id/:role', adminUserController.doEdit);

    app.get('/admin/user/add', adminUserController.create);
    app.post('/admin/user/add', adminUserController.doCreate);
    
    //print enrollment
    app.get('/form', userFormPrintController.index);
    app.post('/form/print', userFormPrintController.print);







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
}