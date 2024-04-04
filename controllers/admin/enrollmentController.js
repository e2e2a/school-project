const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const puppeteerConfig = require('../../puppeteer.config.cjs');
const ejs = require('ejs');
const mongoose = require('mongoose');

const User = require('../../models/user')
const Course = require('../../models/course');
const StudentClass = require('../../models/studentClass');
const StudentProfile = require('../../models/studentProfile');
const Section = require('../../models/section');
const Prospectus = require('../../models/prospectus');
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    const studentProfiles = await StudentProfile.find().populate('courseId')
    const coursesSidebar = await Course.find();
    res.render('admin/enrollmentView', {
        site_title: SITE_TITLE,
        title: 'Enrollments',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        studentProfiles: studentProfiles,
        coursesSidebar: coursesSidebar,
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
            console.log('e')
        }
    } catch (error) {
        console.log('error', error);
        req.flash('message', 'Internal error occurred.');
        return res.status(500).send('500', error);
    }
}

module.exports.enrolled = async (req, res) => {
    const schedules = await StudentClass.find().populate('subjects.subjectId').populate('studentId').populate('courseId').populate('sectionId');
    const coursesSidebar = await Course.find();
    res.render('admin/enrolledView', {
        site_title: SITE_TITLE,
        title: 'Professors Schedule',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        schedules: schedules,
        coursesSidebar: coursesSidebar
    });
}

module.exports.studentScheduleView = async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid ObjectId:', id);
        return res.status(404).render('404');
    }
    const schedule = await StudentClass.findById(id).populate('subjects.subjectId').populate('studentId').populate('courseId').populate('sectionId').populate('subjects.professorId');
    const coursesSidebar = await Course.find();
    res.render('admin/studentScheduleView', {
        site_title: SITE_TITLE,
        title: 'Professors Schedule',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        schedule: schedule,
        coursesSidebar: coursesSidebar
    });
}

module.exports.enrolledCancel = async (req, res) => {
    const studentId = req.body.studentId;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        console.log('Invalid ObjectId:', studentId);
        req.flash('message', 'Invalid studentId.');
        return res.redirect('/admin/enrollments');
    }
    const studentClassId = req.body.studentClassId;
    if (!mongoose.Types.ObjectId.isValid(studentClassId)) {
        console.log('Invalid ObjectId:', studentClassId);
        req.flash('message', 'Invalid studentClassId.');
        return res.redirect('/admin/enrollments');
    }
    await StudentClass.findByIdAndDelete(studentClassId);
    await StudentProfile.findByIdAndUpdate(studentId, { isEnrolled: false, isEnrolling: true }, { new: true });
    console.log('enrollment cancel successfully');
    return res.redirect('/admin/enrollments/enrolled');
}

module.exports.studentProspectus = async (req, res) => {
    const students = await StudentProfile.find({ isVerified: true, isStudying: true }).populate('courseId')
    const coursesSidebar = await Course.find();
    res.render('admin/studentProspectus', {
        site_title: SITE_TITLE,
        title: 'Prospectus',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        students: students,
        coursesSidebar: coursesSidebar,
    });
}

module.exports.studentProspectusView = async (req, res) => {
    const studentId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        console.log('Invalid ObjectId:', studentId);
        req.flash('message', 'Invalid studentId.');
        return res.redirect('/admin/enrollments');
    }
    const studentProspectus = await Prospectus.find({ studentId: studentId });
    const coursesSidebar = await Course.find();
    res.render('admin/studentProspectusView', {
        site_title: SITE_TITLE,
        title: 'Prospectus',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        studentProspectus: studentProspectus,
        coursesSidebar: coursesSidebar,
    });
}

module.exports.studentProspectusViewAll = async (req, res) => {
    const studentProspectus = await Prospectus.find();
    const coursesSidebar = await Course.find();
    res.render('admin/studentProspectusViewAll', {
        site_title: SITE_TITLE,
        title: 'Prospectus',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        studentProspectus: studentProspectus,
        coursesSidebar: coursesSidebar,
    });
}