const User = require('../../models/user')
const Subject = require('../../models/subject');
const Course = require('../../models/course');
const StudentClass = require('../../models/studentClass');
const Section = require('../../models/section');
const mongoose = require('mongoose');
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    const subjects = await Subject.find()
    const coursesSidebar = await Course.find();
    res.render('admin/subjectView', {
        site_title: SITE_TITLE,
        title: 'Subject',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        subjects: subjects,
        coursesSidebar: coursesSidebar,
    });
}
module.exports.create = async (req, res) => {
    if (!req.query.category || !req.query.year || !req.query.semester || !req.query.section) {
        console.log('Query fields are empty');
        req.flash('message', 'Query fields are empty');
        return res.status(404).render('404');
    }
    const courses = await Course.find()
    const coursesSidebar = await Course.find();
    res.render('admin/subjectAdd', {
        site_title: SITE_TITLE,
        title: 'Subject',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        courses: courses,
        coursesSidebar: coursesSidebar,
    });
}
module.exports.doCreate = async (req, res) => {
    // 
    const category = req.query.category;
    const year = req.query.year;
    const semester = req.query.semester;
    const section = req.query.section;
    // 
    const course = await Course.findOne({category:category})
    console.log(category)
    if (course) {
        const checkSection = await Section.findOne({
            courseId: course._id,
            year: year,
            semester: semester,
            section: section
        });
        if (checkSection) {
            const subject = new Subject({
                courseId: course._id,
                subjectCode: req.body.subjectCode,
                name: course.name,
                category: course.category,
                unit: req.body.unit,
                year: year,
                semester: semester,
                section: section,
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
                return res.redirect(`/admin/category?category=${category}&year=${year}&semester=${semester}&section=${section}`);
            } catch (error) {
                console.error('Error saving section:', error);
                return res.redirect(`/admin/category?category=${category}&year=${year}&semester=${semester}&section=${section}`);
            }
        } else {
            console.log('A Section didnt exist. Please check the sections list.');
            req.flash('message', 'A Section didnt exist. Please check the sections list.');
            return res.redirect(`/admin/subject/add?category=${category}&year=${year}&semester=${semester}&section=${section}`);
        }
    } else {
        console.log('no courses found.please check the course name.');
        req.flash('message', 'No courses found. Please check the course selected.');
        return res.redirect(`/admin/subject/add?category=${category}&year=${year}&semester=${semester}&section=${section}`);
    }
} 