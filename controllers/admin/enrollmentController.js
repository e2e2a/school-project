const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const puppeteerConfig = require('../../puppeteer.config.cjs');
const ejs = require('ejs');
const mongoose = require('mongoose');
const Schedule = require('../../models/schedule');
const User = require('../../models/user')
const Course = require('../../models/course');
const StudentClass = require('../../models/studentClass');
const StudentProfile = require('../../models/studentProfile');
const Section = require('../../models/section');
const Prospectus = require('../../models/prospectus');
const AdminProfile = require('../../models/adminProfile');
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    const studentProfiles = await StudentProfile.find().populate('courseId')
    const coursesSidebar = await Course.find();
    const adminProfile = await AdminProfile.findOne({ userId: req.session.login });
    res.render('admin/enrollmentView', {
        site_title: SITE_TITLE,
        title: 'Enrollments',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        studentProfiles: studentProfiles,
        coursesSidebar: coursesSidebar,
        adminProfile: adminProfile,
    });
}

module.exports.doEnroll = async (req, res) => {
    try {
        const actions = req.body.actions;
        if (actions === 'approved') {
            const studentId = req.body.studentId;
            if (!mongoose.Types.ObjectId.isValid(studentId)) {
                console.log('Invalid ObjectId:', studentId);
                req.flash('message', 'Invalid studentId.');
                return res.redirect('/admin/enrollments/enrolling');
            }
            const studentProfile = await StudentProfile.findById(studentId);
            if (studentProfile) {
                const courseId = req.body.courseId;
                if (!mongoose.Types.ObjectId.isValid(courseId)) {
                    console.log('Invalid ObjectId:', courseId);
                    req.flash('message', 'Invalid courseId.');
                    return res.redirect('/admin/enrollments/enrolling');
                }
                const course = await Course.findById(courseId)
                if (!req.body.type) {
                    console.log('Student Type is Required.');
                    req.flash('message', 'Student Type is Required.');
                    return res.redirect('/admin/enrollments/enrolling');
                }
                if (req.body.type === 'Regular') {
                    if (!req.body.year || !req.body.semester || !req.body.section || !req.body.batch) {
                        console.log('Required fields are missing in the request body');
                        req.flash('message', 'Please make sure to put year, semester, section and batch.');
                        return res.redirect('/admin/enrollments/enrolling');
                    }
                    const checkSection = await Section.findOne({
                        courseId: course._id,
                        year: req.body.year,
                        semester: req.body.semester,
                        section: req.body.section
                    }).populate('subjects.subjectId');
                    if (checkSection) {
                        const subjects = checkSection.subjects.map(subject => ({
                            subjectId: subject.subjectId,
                            professorId: subject.professorId,
                            days: subject.days,
                            startTime: subject.startTime,
                            endTime: subject.endTime,
                            grade: null
                        }));

                        const studentClass = new StudentClass({
                            studentId: studentProfile._id,
                            courseId: studentProfile.courseId,
                            sectionId: checkSection._id,
                            subjects: subjects,
                            courseName: course.name,
                            category: course.category,
                            year: req.body.year,
                            semester: req.body.semester,
                            section: req.body.section,
                            batch: req.body.batch,
                            type: req.body.type,
                            status: true,
                        });
                        console.log('student', studentClass)
                        await studentClass.save();
                        await StudentProfile.findByIdAndUpdate(studentProfile._id, { isEnrolled: true, isEnrolling: false }, { new: true });
                        console.log('student class save.');
                        req.flash('message', 'Student enrolled sucessfully.');
                        return res.redirect('/admin/enrollments/enrolling');
                    } else {
                        console.log('no section found to enroll.');
                        req.flash('message', 'No Section found to enroll the student.');
                        return res.redirect('/admin/enrollments/enrolling');
                    }
                } else if (req.body.type === 'Irregular') {
                    if (!req.body.year || !req.body.semester || !req.body.batch) {
                        console.log('Required fields are missing in the request body');
                        req.flash('message', 'Please make sure to put year, semester and batch.');
                        return res.redirect('/admin/enrollments/enrolling');
                    }
                    const studentClass = new StudentClass({
                        studentId: studentProfile._id,
                        courseId: studentProfile.courseId,
                        courseName: course.name,
                        category: course.category,
                        year: req.body.year,
                        semester: req.body.semester,
                        batch: req.body.batch,
                        type: req.body.type,
                        status: true,
                    });
                    console.log('student', studentClass)
                    await studentClass.save();
                    await StudentProfile.findByIdAndUpdate(studentProfile._id, { isEnrolled: true, isEnrolling: false }, { new: true });
                    console.log('student class save.');
                    req.flash('message', 'Student enrolled sucessfully.');
                    return res.redirect('/admin/enrollments/enrolling');
                }
            } else {
                console.log('no student found.');
                req.flash('message', 'No student found.');
                return res.redirect('/admin/enrollments/enrolling');
            }
        } else if (actions === 'print') {
            try {
                const studentId = req.body.studentId;
                console.log('studentId', studentId)
                if (!mongoose.Types.ObjectId.isValid(studentId)) {
                    console.log('Invalid ObjectId:', studentId);
                    req.flash('message', 'Invalid studentId.');
                    return res.redirect('/admin/enrollments');
                }
                const studentProfile = await StudentProfile.findById(studentId).populate('userId').populate('courseId');
                const templatePath = path.join(__dirname, '../../views/pdf/enrollment.ejs');
                const templateContent = await fs.readFile(templatePath, 'utf-8');
                const html = ejs.render(templateContent, { studentProfile: studentProfile });

                const browser = await puppeteer.launch({
                    ...puppeteerConfig,

                    headless: true
                });

                const page = await browser.newPage();
                await page.setContent(html);

                const pdfBuffer = await page.pdf({
                    format: 'Legal',
                    printBackground: true,
                });

                await browser.close();

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `inline; filename="enrolly.pdf"`);
                res.send(pdfBuffer);
            } catch (err) {
                console.log('err:', err);
                req.flash('message', 'Internal error occurred.');
                return res.status(500).send('500', err);
            }
        } else if (actions === 'declined') {
            const studentId = req.body.studentId;
            if (!mongoose.Types.ObjectId.isValid(studentId)) {
                console.log('Invalid ObjectId:', studentId);
                req.flash('message', 'Invalid studentId.');
                return res.redirect('/admin/enrollments/enrolling');
            }
            await StudentProfile.findByIdAndUpdate(studentId, { isEnrolling: false }, { new: true })
            return res.redirect('/admin/enrollments/enrolling');
        }
    } catch (error) {
        console.log('error', error);
        req.flash('message', 'Internal error occurred.');
        return res.status(500).send('500', error);
    }
}

module.exports.enrolled = async (req, res) => {
    const schedules = await StudentClass.find({ type: 'Regular' }).populate('subjects.subjectId').populate('studentId').populate('courseId').populate('sectionId');
    const coursesSidebar = await Course.find();
    const adminProfile = await AdminProfile.findOne({ userId: req.session.login });
    res.render('admin/enrolledView', {
        site_title: SITE_TITLE,
        title: 'Enrolled Regular',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        schedules: schedules,
        coursesSidebar: coursesSidebar,
        adminProfile: adminProfile,
    });
}

module.exports.enrolledIrregular = async (req, res) => {
    const schedules = await StudentClass.find({ type: 'Irregular' }).populate('subjects.subjectId').populate('studentId').populate('courseId').populate('sectionId');
    const coursesSidebar = await Course.find();
    const adminProfile = await AdminProfile.findOne({ userId: req.session.login });
    res.render('admin/enrolledtIrregularView', {
        site_title: SITE_TITLE,
        title: 'Enrolled Irregular',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        schedules: schedules,
        coursesSidebar: coursesSidebar,
        adminProfile: adminProfile,
    });
}

module.exports.studentScheduleView = async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid ObjectId:', id);
        return res.status(404).render('404', { role: 'admin' });
    }
    const type = req.params.type;
    let schedule;
    switch (type) {
        case 'Regular':
            schedule = await StudentClass.findById(id).populate('subjects.subjectId').populate('studentId').populate('courseId').populate('sectionId').populate('subjects.professorId');
            break;
        default:
            console.log('Role not recognized:', type);
            return res.status(404).render('404', { role: 'admin' });
    }
    const coursesSidebar = await Course.find();
    const adminProfile = await AdminProfile.findOne({ userId: req.session.login });
    res.render('admin/studentScheduleView', {
        site_title: SITE_TITLE,
        title: 'Student Schedule',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        schedule: schedule,
        coursesSidebar: coursesSidebar,
        adminProfile: adminProfile,
    });
}

module.exports.studentIrregularScheduleView = async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid ObjectId:', id);
        return res.status(404).render('404', { role: 'admin' });
    }
    const type = req.params.type;
    let schedule;
    switch (type) {
        case 'Irregular':
            schedule = await StudentClass.findById(id).populate('subjects.subjectId').populate('studentId').populate('courseId').populate('sectionId').populate('subjects.professorId');
            break;
        default:
            console.log('Role not recognized:', type);
            return res.status(404).render('404', { role: 'admin' });
    }
    const coursesSidebar = await Course.find();
    const adminProfile = await AdminProfile.findOne({ userId: req.session.login });
    res.render('admin/studentIrregularScheduleView', {
        site_title: SITE_TITLE,
        title: 'Student Schedule',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        schedule: schedule,
        coursesSidebar: coursesSidebar,
        adminProfile: adminProfile,
    });
}

module.exports.studentIrregularAddSubject = async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid ObjectId:', id);
        return res.status(404).render('404', { role: 'admin' });
    }
    const type = req.params.type;
    let schedule;
    switch (type) {
        case 'Irregular':
            schedule = await StudentClass.findById(id).populate('subjects.subjectId').populate('studentId').populate('courseId').populate('subjects.professorId');
            break;
        default:
            console.log('Role not recognized:', type);
            return res.status(404).render('404', { role: 'admin' });
    }
    const professorSchedule = await Schedule.find().populate('professorId').populate('schedule.subjectId');
    const coursesSidebar = await Course.find();
    const adminProfile = await AdminProfile.findOne({ userId: req.session.login });
    res.render('admin/studentIrregularSubjects', {
        site_title: SITE_TITLE,
        title: 'Student Schedule',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        schedule: schedule,
        coursesSidebar: coursesSidebar,
        adminProfile: adminProfile,
        professorSchedule: professorSchedule,
    });
}

module.exports.studentIrregularDoAddSubject = async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid id:', id);
        return res.status(404).render('404', { role: 'admin' });
    }
    const subjectId = req.body.subjectId;
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
        console.log('Invalid subjectId:', subjectId);
        return res.status(404).render('404', { role: 'admin' });
    }
    const type = req.params.type;
    let schedule;
    switch (type) {
        case 'Irregular':
            schedule = await StudentClass.findById(id).populate('subjects.subjectId').populate('studentId').populate('courseId').populate('subjects.professorId');
            break;
        default:
            console.log('Role not recognized:', type);
            return res.status(404).render('404', { role: 'admin' });
    }
    const professorId = req.body.professorId;
    if (!mongoose.Types.ObjectId.isValid(professorId)) {
        console.log('Invalid professorId:', professorId);
        return res.status(404).render('404', { role: 'admin' });
    }
    const professorSchedule = await Schedule.findOne({ professorId: professorId }).populate('professorId').populate('schedule.subjectId');

    const foundSubject = professorSchedule.schedule.find(subject => subject.subjectId._id.toString() === subjectId); // Using find instead of findIndex
    console.log('foundSubject', foundSubject);

    const existingStudentSubject = schedule.subjects.find(subject => subject.subjectId && subject.subjectId._id.toString() === subjectId);
    console.log(existingStudentSubject)
    if (existingStudentSubject) {
        console.log('Subject already added');
        req.flash('message', 'subject is already added.');
        return res.redirect(`/admin/enrollment/student/schedule/irregular/add/subjects/${id}/${type}`);
    } else {
        const { subjectId, days, startTime, endTime } = foundSubject;

        schedule.subjects.push({ subjectId, professorId, days, startTime, endTime, });

        await schedule.save();
    }
    console.log('subject added to student:', schedule);
    res.redirect(`/admin/enrollment/student/schedule/irregular/add/subjects/${id}/${type}`);
}

module.exports.enrolledCancel = async (req, res) => {
    const studentId = req.body.studentId;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        console.log('Invalid ObjectId:', studentId);
        req.flash('message', 'Invalid studentId.');
        return res.status(404).render('404', { role: 'admin' });
    }
    const studentClassId = req.body.studentClassId;
    if (!mongoose.Types.ObjectId.isValid(studentClassId)) {
        console.log('Invalid ObjectId:', studentClassId);
        req.flash('message', 'Invalid studentClassId.');
        return res.status(404).render('404', { role: 'admin' });
    }
    await StudentClass.findByIdAndDelete(studentClassId);
    await StudentProfile.findByIdAndUpdate(studentId, { isEnrolled: false, isEnrolling: true, printLimit: 0 }, { new: true });
    console.log('enrollment cancel successfully');
    return res.redirect('/admin/enrollments/enrolled');
}

module.exports.studentProspectus = async (req, res) => {
    const students = await StudentProfile.find({ isVerified: true, isStudying: true }).populate('courseId')
    const coursesSidebar = await Course.find();
    const adminProfile = await AdminProfile.findOne({ userId: req.session.login });
    res.render('admin/studentProspectus', {
        site_title: SITE_TITLE,
        title: 'Prospectus',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        students: students,
        coursesSidebar: coursesSidebar,
        adminProfile: adminProfile,
    });
}

module.exports.studentProspectusView = async (req, res) => {
    const studentId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        console.log('Invalid ObjectId:', studentId);
        req.flash('message', 'Invalid studentId.');
        return res.status(404).render('404', { role: 'admin' });
    }
    const studentProspectus = await Prospectus.find({ studentId: studentId });
    const coursesSidebar = await Course.find();
    const adminProfile = await AdminProfile.findOne({ userId: req.session.login });
    res.render('admin/studentProspectusView', {
        site_title: SITE_TITLE,
        title: 'Prospectus',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        studentProspectus: studentProspectus,
        coursesSidebar: coursesSidebar,
        adminProfile: adminProfile,
    });
}

module.exports.studentProspectusViewAll = async (req, res) => {
    const studentProspectus = await Prospectus.find();
    const coursesSidebar = await Course.find();
    const adminProfile = await AdminProfile.findOne({ userId: req.session.login });
    res.render('admin/studentProspectusViewAll', {
        site_title: SITE_TITLE,
        title: 'Prospectus',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        studentProspectus: studentProspectus,
        coursesSidebar: coursesSidebar,
        adminProfile: adminProfile,
    });
}