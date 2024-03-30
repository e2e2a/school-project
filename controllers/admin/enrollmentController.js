const User = require('../../models/user')
const Course = require('../../models/course');
const StudentClass = require('../../models/studentClass');
const StudentProfile = require('../../models/studentProfile');
const Section = require('../../models/section');
const SITE_TITLE = 'DSF';
/****
 * #
 * #modules for print
 * #
*****/
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const puppeteerConfig = require('../../puppeteer.config.cjs');
const ejs = require('ejs');
const mongoose = require('mongoose');

module.exports.index = async (req, res) => {
    const studentProfiles = await StudentProfile.find().populate('courseId')
    res.render('admin/enrollmentView', {
        site_title: SITE_TITLE,
        title: 'Enrollments',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        studentProfiles: studentProfiles,
    });
}
module.exports.doEnroll = async (req, res) => {
    try {
        const actions = req.body.actions;
        if (actions === 'approved') {
            const studentId = req.body.studentId;
            if (!mongoose.Types.ObjectId.isValid(studentId)) {
                console.log('Invalid ObjectId:', studentId);
                return res.status(404).render('404');
            }
            const studentProfile = await StudentProfile.findById(studentId);
            if (studentProfile) {
                const courseId = req.body.courseId;
                if (!mongoose.Types.ObjectId.isValid(courseId)) {
                    console.log('Invalid ObjectId:', courseId);
                    return res.status(404).render('404');
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
                        status: true,
                    });
                    console.log('student', studentClass)
                    await studentClass.save();
                    await StudentProfile.findByIdAndUpdate(studentProfile._id, { isEnrolled: true, isEnrolling: false }, { new: true });
                    console.log('student class save.');
                    return res.redirect('/admin/enrollments');
                } else {
                    console.log('no section found to enroll.');
                    return res.redirect('/admin/enrollments');
                }
            } else {
                console.log('no student found.');
            }
        } else if (actions === 'print') {
            try {
                const studentId = req.body.studentId;
                console.log('studentId', studentId)
                if (!mongoose.Types.ObjectId.isValid(studentId)) {
                    console.log('Invalid ObjectId:', studentId);
                    return res.status(404).render('404');
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
    }

}