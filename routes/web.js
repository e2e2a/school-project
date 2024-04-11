const { isAdmin, isProfessor, isProfessorProfileVerified, isStudent, isStudentProfileVerified } = require('../helper/auth-helper');

const authRegisterController = require('../controllers/auth/registerController');
const authVerifyController = require('../controllers/auth/verifyController');
const authLoginController = require('../controllers/auth/loginController');
const authLogoutController = require('../controllers/auth/logoutController');
const authVerifyEditEmailController = require('../controllers/auth/verifyEditEmailController');
const authResetPassword = require('../controllers/auth/resetPassword/verifyForgot_password');

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
const professorRecordController = require('../controllers/professor/recordController');

//admin
const adminIndexController = require('../controllers/admin/indexController');
const adminCourseController = require('../controllers/admin/courseController');
const adminEnrollmentController = require('../controllers/admin/enrollmentController');
const adminSubjectController = require('../controllers/admin/subjectController');
const adminsectionController = require('../controllers/admin/sectionController');
const adminCategoryController = require('../controllers/admin/categoryController');
const adminUserController = require('../controllers/admin/userController');
const adminScheduleController = require('../controllers/admin/scheduleController');
const adminEndSemesterController = require('../controllers/admin/endSemesterController');

module.exports = function (app) {
    /**
     * auth
     */
    app.get('/', authLoginController.login);
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

    /**
     * student
     */
    app.get('/student', isStudent, isStudentProfileVerified, userIndexController.index);
    app.get('/profile', isStudent, userProfileController.index);
    app.post('/profile/update', isStudent, userProfileController.update);
    app.get('/courses', isStudent, isStudentProfileVerified, userCourseController.index);
    app.post('/course/enroll', isStudent, isStudentProfileVerified, userCourseController.enroll);
    app.get('/enrollment/subjects', isStudent, isStudentProfileVerified, userEnrollmentController.index);
    app.get('/enrollment/prospectus', isStudent, isStudentProfileVerified, userEnrollmentController.prospectus);
    app.get('/form', isStudent, isStudentProfileVerified, userFormPrintController.index);
    app.post('/form/print', isStudent, isStudentProfileVerified, userFormPrintController.print);
    
    /**
     * professor
     */
    app.get('/professor', isProfessor, isProfessorProfileVerified, professorIndexController.index);
    app.get('/professor/profile', isProfessor, professorProfileController.index);
    app.post('/professor/profile', isProfessor, professorProfileController.update);
    app.get('/professor/schedule', isProfessor, isProfessorProfileVerified, professorScheduleController.schedule);
    app.get('/professor/class', isProfessor, isProfessorProfileVerified, professorClassController.index);
    app.get('/professor/class/single/:id', isProfessor, isProfessorProfileVerified, professorClassController.singleClass);
    app.post('/professor/class/single/:id', isProfessor, isProfessorProfileVerified, professorClassController.singleClassDoGrade);
    app.post('/professor/class/doGrade', isProfessor, isProfessorProfileVerified, professorClassController.doGrade);
    app.get('/professor/records', isProfessor, isProfessorProfileVerified, professorRecordController.professorRecord);

    /**
     * admin
     */
    app.get('/admin', isAdmin, adminIndexController.index);
    app.get('/admin/courses', isAdmin, adminCourseController.index);
    app.post('/admin/courses', isAdmin, adminCourseController.delete);
    app.get('/admin/course/add', isAdmin, adminCourseController.create);
    app.post('/admin/course/add', isAdmin, adminCourseController.doCreate);
    app.get('/admin/course/edit/:id', isAdmin, adminCourseController.edit);
    app.post('/admin/course/edit/:id', isAdmin, adminCourseController.doEdit);
    app.get('/admin/enrollments/enrolling', isAdmin, adminEnrollmentController.index);
    app.post('/admin/enrollment/doEnroll', isAdmin, adminEnrollmentController.doEnroll);
    app.get('/admin/enrollments/enrolled', isAdmin, adminEnrollmentController.enrolled);
    app.get('/admin/enrollments/enrolled/irregular', isAdmin, adminEnrollmentController.enrolledIrregular);
    app.post('/admin/enrollments/enrolled/irregular', isAdmin, adminEndSemesterController.irregularEndSemester);
    app.get('/admin/enrollment/student/schedule/irregular/:id/:type', isAdmin, adminEnrollmentController.studentIrregularScheduleView);
    app.post('/admin/enrollment/student/schedule/irregular/:id/:type', isAdmin, adminEnrollmentController.studentIrregularRemoveAddSubject);
    app.get('/admin/enrollment/student/schedule/irregular/add/subjects/:id/:type', isAdmin, adminEnrollmentController.studentIrregularAddSubject);
    app.post('/admin/enrollment/student/schedule/irregular/add/subjects/:id/:type', isAdmin, adminEnrollmentController.studentIrregularDoAddSubject);
    // irregular

    app.get('/admin/enrollment/student/schedule/:id/:type', isAdmin, adminEnrollmentController.studentScheduleView);
    app.post('/admin/enrollment/enrolled/cancel', isAdmin, adminEnrollmentController.enrolledCancel);
    app.get('/admin/enrollment/student/prospectus', isAdmin, adminEnrollmentController.studentProspectus);
    app.get('/admin/enrollment/student/prospectus/:id', isAdmin, adminEnrollmentController.studentProspectusView);
    app.get('/admin/enrollment/student/prospectus/view/all', isAdmin, adminEnrollmentController.studentProspectusViewAll);
    app.get('/admin/sections', isAdmin, adminsectionController.index);
    app.get('/admin/section/add', isAdmin, adminsectionController.create);
    app.post('/admin/section/add', isAdmin, adminsectionController.doCreate);
    app.get('/admin/section/edit/:id', isAdmin, adminsectionController.edit);
    app.post('/admin/section/edit/:id', isAdmin, adminsectionController.doEdit);
    app.post('/admin/section/delete/:id', isAdmin, adminsectionController.delete);
    app.get('/admin/subjects', isAdmin, adminSubjectController.index);
    app.get('/admin/subject/add', isAdmin, adminSubjectController.create);
    app.post('/admin/subject/add', isAdmin, adminSubjectController.doCreate);
    app.get('/admin/subject/edit/:id', isAdmin, adminSubjectController.edit);
    app.post('/admin/subject/edit/:id', isAdmin, adminSubjectController.doEdit);
    app.get('/admin/category', isAdmin, adminCategoryController.index);
    app.post('/admin/category', isAdmin, adminCategoryController.actions);
    app.post('/admin/category/endSemester', isAdmin, adminEndSemesterController.endSemester)
    app.get('/admin/professors/schedule', isAdmin, adminScheduleController.professor);
    app.get('/admin/professors/schedule/histories', isAdmin, adminScheduleController.professorHistory);
    app.get('/admin/professors/schedule/history/:id', isAdmin, adminScheduleController.professorHistoryView);
    app.post('/admin/professors/schedule/doHistory', isAdmin, adminScheduleController.professorDoHistory);
    app.get('/admin/professor/schedule/:id', isAdmin, adminScheduleController.professorView);
    app.get('/admin/professor/classes/:id', isAdmin, adminScheduleController.professorClassesView);
    app.get('/admin/user/student/list', isAdmin, adminUserController.student);
    app.get('/admin/user/professor/list', isAdmin, adminUserController.professor);
    app.get('/admin/user/admin/list', isAdmin, adminUserController.admin);
    app.get('/admin/user/edit/:id/:role', isAdmin, adminUserController.edit);
    app.post('/admin/user/edit/:id/:role', isAdmin, adminUserController.doEdit);
    app.get('/admin/user/add', isAdmin, adminUserController.create);
    app.post('/admin/user/add', isAdmin, adminUserController.doCreate);
}