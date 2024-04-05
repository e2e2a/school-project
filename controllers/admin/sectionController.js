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
    const category = req.query.category;
    const year = req.query.year;
    const semester = req.query.semester;

    if (!category || !year || !semester || category.trim() === '' || year.trim() === '' || semester.trim() === '') {
        console.log('One or more parameters are missing or empty.');
        return res.status(404).render('404', { role: 'admin' });
    }

    const course = await Course.findOne({ category: category }); 

    if (!course) {
        console.log('No courses found. Please check the course name.');
        return res.status(404).render('404', { role: 'admin' });
    }
    console.log('course', course)
    const existingSection = await Section.findOne({
        courseId: course._id,
        year: year,
        semester: semester,
        section: req.body.section
    });

    if (existingSection) {
        console.log('A section with the same year, semester, and section already exists. Please check the sections list.');
        req.flash('message', 'Section already exists. Please check the sections list.');
        return res.redirect(`/admin/section/add?category=${category}&year=${year}&semester=${semester}`);
    }

    const section = new Section({
        courseId: course._id,
        category: course.category,
        year: year,
        semester: semester,
        section: req.body.section,
        description: req.body.description,
    });

    await section.save(); // Save the section

    console.log('Section created successfully.');
    req.flash('message', 'Section created successfully.');
    return res.redirect(`/admin/category?category=${category}&year=${year}&semester=${semester}`);
} 