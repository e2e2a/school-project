const User = require('../../models/user')
const Subject = require('../../models/subject');
const StudentClass = require('../../models/studentClass');
const StudentProfile = require('../../models/studentProfile');
const ProfessorProfile = require('../../models/professorProfile');
const AdminProfile = require('../../models/adminProfile');
const Section = require('../../models/section');
const Course = require('../../models/course');
const Schedule = require('../../models/schedule');
const mongoose = require('mongoose');
const SITE_TITLE = 'DSF';

module.exports.professor = async (req, res) => {
    const schedules = await Schedule.find().populate('schedule.subjectId').populate('professorId');
    const coursesSidebar = await Course.find();
    res.render('admin/professorSchedules', {
        site_title: SITE_TITLE,
        title: 'Professors Schedule',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        schedules: schedules,
        coursesSidebar: coursesSidebar
    });
}
module.exports.professorView = async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid ObjectId:', id);
        return res.status(404).render('404');
    }
    const schedule = await Schedule.findById(id).populate('schedule.subjectId').populate('professorId');
    const coursesSidebar = await Course.find();
    res.render('admin/professorScheduleView', {
        site_title: SITE_TITLE,
        title: 'Professors Schedule',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        schedule: schedule,
        coursesSidebar: coursesSidebar
    });
}
module.exports.professorClassesView = async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid ObjectId:', id);
        return res.status(404).render('404');
    }
    const professorSchedule = await Schedule.findById(id).populate('schedule.subjectId')
        .populate({
            path: 'schedule.subjectId',
            populate: {
                path: 'courseId',
                model: 'Course'
            }
        }).populate('professorId');
    const studentClasses = await StudentClass.find({ 'subjects.professorId': professorSchedule.professorId }).populate('subjects.subjectId').populate('studentId');
    const coursesSidebar = await Course.find();
    res.render('admin/professorClassesView', {
        site_title: SITE_TITLE,
        title: 'Professor Classes',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        professorSchedule: professorSchedule,
        studentClasses: studentClasses,
        coursesSidebar: coursesSidebar
    });
}
