const User = require('../../models/user')
const Subject = require('../../models/subject');
const StudentClass = require('../../models/studentClass');
const StudentProfile = require('../../models/studentProfile');
const ProfessorProfile = require('../../models/professorProfile');
const AdminProfile = require('../../models/adminProfile');
const Section = require('../../models/section');
const Course = require('../../models/course');
const Schedule = require('../../models/schedule');
const ProfessorScheduleHistory = require('../../models/professorScheduleHistory')
const mongoose = require('mongoose');
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    const studentClasses = await StudentClass.find();

    const users = await User.find();
    const coursesSidebar = await Course.find();
    const studentEnrolling = await StudentProfile.countDocuments({ isEnrolling: true });
    const studentEnrolled = await StudentProfile.countDocuments({ isEnrolled: true });
    const studentRecentEnrolled = await StudentProfile.countDocuments({ isStudying: true });


    const firstYearFirstSemesterCount = await StudentClass.countDocuments({ year: '1st Year', semester: '1st Semester' });
    const firstYearSecondSemesterCount = await StudentClass.countDocuments({ year: '1st Year', semester: '2nd Semester' });
    const secondYearFirstSemesterCount = await StudentClass.countDocuments({ year: '2nd Year', semester: '1st Semester' });
    const secondYearSecondSemesterCount = await StudentClass.countDocuments({ year: '2nd Year', semester: '2nd Semester' });
    const thirdYearFirstSemesterCount = await StudentClass.countDocuments({ year: '3rd Year', semester: '1st Semester' });
    const thirdYearSecondSemesterCount = await StudentClass.countDocuments({ year: '3rd Year', semester: '2nd Semester' });
    const adminProfile = await AdminProfile.findOne({ userId: req.session.login });
    res.render('admin/index/index', {
        site_title: SITE_TITLE,
        title: 'Home',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        users: users,
        studentClasses: studentClasses,
        coursesSidebar: coursesSidebar,
        firstYearFirstSemesterCount: firstYearFirstSemesterCount,
        firstYearSecondSemesterCount: firstYearSecondSemesterCount,
        secondYearFirstSemesterCount: secondYearFirstSemesterCount,
        secondYearSecondSemesterCount: secondYearSecondSemesterCount,
        thirdYearFirstSemesterCount: thirdYearFirstSemesterCount,
        thirdYearSecondSemesterCount: thirdYearSecondSemesterCount,
        studentEnrolling: studentEnrolling,
        studentRecentEnrolled: studentRecentEnrolled,
        studentEnrolled: studentEnrolled,
        adminProfile: adminProfile,
    });
}