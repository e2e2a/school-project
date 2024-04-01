const User = require('../../models/user')
const Subject = require('../../models/subject');
const Course = require('../../models/course');
const Section = require('../../models/section');
const mongoose = require('mongoose');
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    const sections = await Section.find().populate('courseId');
    const coursesSidebar = await Course.find();
    res.render('admin/sectionView', {
        site_title: SITE_TITLE,
        title: 'Section',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        sections: sections,
        coursesSidebar: coursesSidebar,
    });
}

module.exports.create = async (req, res) => {
    const courses = await Course.find()
    const coursesSidebar = await Course.find();
    res.render('admin/sectionAdd', {
        site_title: SITE_TITLE,
        title: 'Section',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        courses: courses,
        coursesSidebar: coursesSidebar,
    });
}
module.exports.doCreate = async (req, res) => {
    const courseId = req.body.courseId;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        console.log('Invalid ObjectId:', courseId);
        req.flash('message', 'Invalid courseId.');
        return res.redirect('/admin/section/add');
    }
    const course = await Course.findById(courseId)
    if (course) {
        const existingSection = await Section.findOne({
            courseId: courseId,
            year: req.body.year,
            semester: req.body.semester,
            section: req.body.section
        });
        if (existingSection) {
            console.log('A section with the same year, semester, and section already exists. Please check the sections list.');
            req.flash('message', 'Section already exists. Please check the sections list.');
            return res.redirect('/admin/section/add');
        }
        const section = new Section({
            courseId: courseId,
            category: course.category,
            year: req.body.year,
            semester: req.body.semester,
            section: req.body.section,
            description: req.body.description,
        });
        await section.save();
        console.log('Section created save.');
        req.flash('message', 'Section created successfully.');
        return res.redirect('/admin/section/add');
    } else {
        console.log('no courses found.please check the course name.');
        req.flash('message', 'No courses found. Please check the course name.');
        return res.redirect('/admin/section/add');
    }
} 