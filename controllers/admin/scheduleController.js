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
        return res.status(404).render('404', { role: 'admin' });
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
        return res.status(404).render('404', { role: 'admin' });
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

module.exports.professorDoHistory = async (req, res) => {
    const batch = req.body.batch;
    const studentClasses = await StudentClass.find();
    if (studentClasses.length > 0) {
        req.flash('message', 'Cannot make a schedule history if there is a student still studying.')
        return res.redirect('/admin/professors/schedule')
    }
    const schedules = await Schedule.find().populate('schedule.subjectId').populate('professorId');
    if(schedules.length === 0){
        req.flash('message', 'Cannot make a schedule history. All professors have no schedules.')
        return res.redirect('/admin/professors/schedule')
    }
    for (const schedule of schedules) {
        const { professorId } = schedule;

        const prospectusSubjects = schedule.schedule.map(subject => {
            const subjectId = subject.subjectId;

            return {
                subject: {
                    subjectCode: subjectId.subjectCode,
                    name: subjectId.name,
                    unit: subjectId.unit,
                    category: subjectId.category,
                    year: subjectId.year,
                    semester: subjectId.semester,
                    section: subjectId.section,
                },
                days: subject.days,
                startTime: subject.startTime,
                endTime: subject.endTime,
            };
        });

        const history = new ProfessorScheduleHistory({
            professorId: professorId._id,
            professorName: {
                lastname: professorId.lastname,
                firstname: professorId.firstname,
                middlename: professorId.middlename,
            },
            schedule: prospectusSubjects,
            batch: batch,
        });
        console.log('history', history)
        await history.save();
    }
    const sections = await Section.find();
    for (const section of sections) {
        await Section.updateOne(
            { _id: section._id },
            { $set: { subjects: section.subjects.map(subject => ({ subjectId: subject.subjectId })) } }
        );
    }
    const profSchedDeleted = await Schedule.deleteMany();
    if(profSchedDeleted){
        console.log(`sucess deleting the schedule of professor.`);
    }
    // const result = await Schedule.updateMany({}, { $set: { schedule: [] } });
    // console.log(`${result.nModified} documents updated.`);
    req.flash('message', 'Schedule on Records.')
    return res.redirect('/admin/professors/schedule')
}

module.exports.professorHistoryView = async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid ObjectId:', id);
        return res.status(404).render('404', { role: 'admin' });
    }
    const histories = await ProfessorScheduleHistory.find({ professorId: id }).populate('professorId');
    const coursesSidebar = await Course.find();
    res.render('admin/professorScheduleHistoryView', {
        site_title: SITE_TITLE,
        title: 'Professors Schedule',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        histories: histories,
        coursesSidebar: coursesSidebar
    });
}

module.exports.professorHistory = async (req, res) => {
    const histories = await ProfessorScheduleHistory.find().populate('professorId');
    const coursesSidebar = await Course.find();
    res.render('admin/professorScheduleHistory', {
        site_title: SITE_TITLE,
        title: 'Professors Schedule',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        histories: histories,
        coursesSidebar: coursesSidebar
    });
}