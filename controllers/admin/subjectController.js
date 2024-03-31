const User = require('../../models/user')
const Subject = require('../../models/subject');
const Course = require('../../models/course');
const StudentClass = require('../../models/studentClass');
const Section = require('../../models/section');
const mongoose = require('mongoose');
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    const subjects = await Subject.find()
    res.render('admin/subjectView', {
        site_title: SITE_TITLE,
        title: 'Subject',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        subjects: subjects,
    });
}
module.exports.create = async (req, res) => {
    const courses = await Course.find()
    res.render('admin/subjectAdd', {
        site_title: SITE_TITLE,
        title: 'Subject',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        courses: courses,
    });
}
module.exports.doCreate = async (req, res) => {
    const courseId = req.body.courseId;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        console.log('Invalid ObjectId:', courseId);
        req.flash('message', 'Invalid courseId.');
        return res.redirect('/admin/subject/add');
    }
    const course = await Course.findById(courseId)
    if (course) {
        const checkSection = await Section.findOne({
            courseId: courseId,
            year: req.body.year,
            semester: req.body.semester,
            section: req.body.section
        });
        if (checkSection) {
            const subject = new Subject({
                courseId: courseId,
                subjectCode: req.body.subjectCode,
                name: course.name,
                category: course.category,
                unit: req.body.unit,
                year: req.body.year,
                semester: req.body.semester,
                section: req.body.section,
                description: req.body.description,
            });
            await subject.save();
            console.log('subject created.');
            checkSection.subjects.push({ subjectId: subject._id });
            const studentClasses = await StudentClass.find({ sectionId: checkSection._id });
            try {
                await Promise.all(studentClasses.map(async (studentClass) => {
                    studentClass.subjects.push({ subjectId: subject._id });
                    await studentClass.save();
                    console.log(`Subject added to StudentClass ${studentClass._id}.`);
                }));
                await checkSection.save();
                console.log('Subject added to section.');
                req.flash('message', 'Subject created successfully.');
                return res.redirect('/admin/subject/add');
            } catch (error) {
                console.error('Error saving section:', error);
                return res.redirect('/admin/subject/add');
            }
        } else {
            console.log('A Section didnt exist. Please check the sections list.');
            req.flash('message', 'A Section didnt exist. Please check the sections list.');
            return res.redirect('/admin/subject/add');
        }
    } else {
        console.log('no courses found.please check the course name.');
        req.flash('message', 'No courses found. Please check the course selected.');
        return res.redirect('/admin/subject/add');
    }
} 