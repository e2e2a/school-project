const User = require('../../models/user')
const Subject = require('../../models/subject');
const Course = require('../../models/course');
const Section = require('../../models/section');
const mongoose = require('mongoose');
const section = require('../../models/section');
const AdminProfile = require('../../models/adminProfile');
const StudentClass = require('../../models/studentClass');
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    const sections = await Section.find().populate('courseId');
    const coursesSidebar = await Course.find();
    const adminProfile = await AdminProfile.findOne({ userId: req.session.login });
    res.render('admin/section/sectionView', {
        site_title: SITE_TITLE,
        title: 'Sections',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        sections: sections,
        coursesSidebar: coursesSidebar,
        adminProfile: adminProfile,
    });
}

module.exports.create = async (req, res) => {
    const category = req.query.category;
    const year = req.query.year;
    const semester = req.query.semester;

    if (!category || !year || !semester || category.trim() === '' || year.trim() === '' || semester.trim() === '') {
        console.log('One or more parameters are missing or empty.');
        return res.status(404).render('404', { role: 'admin' });
    }
    const courses = await Course.find()
    const coursesSidebar = await Course.find();
    const adminProfile = await AdminProfile.findOne({ userId: req.session.login });
    res.render('admin/section/sectionAdd', {
        site_title: SITE_TITLE,
        title: 'Section',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        courses: courses,
        coursesSidebar: coursesSidebar,
        adminProfile: adminProfile,
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

module.exports.edit = async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid subjectId:', id);
        return res.status(404).render('404', { role: 'admin' });
    }
    if (!req.query.category || !req.query.year || !req.query.semester) {
        console.log('Query fields are empty');
        req.flash('message', 'Query fields are empty');
        return res.status(404).render('404', { role: 'admin' });
    }
    const section = await Section.findById(id);
    if (!section) {
        return res.status(404).render('404', { role: 'admin' });
    }
    const coursesSidebar = await Course.find();
    const adminProfile = await AdminProfile.findOne({ userId: req.session.login });
    res.render('admin/section/sectionEdit', {
        site_title: SITE_TITLE,
        title: 'Subject',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        section: section,
        coursesSidebar: coursesSidebar,
        adminProfile: adminProfile,
    });
}

module.exports.doEdit = async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid subjectId:', id);
        return res.status(404).render('404', { role: 'admin' });
    }
    if (!req.query.category || !req.query.year || !req.query.semester) {
        console.log('Query fields are empty');
        req.flash('message', 'Query fields are empty');
        return res.status(404).render('404', { role: 'admin' });
    }
    const data = {
        section: req.body.section,
        description: req.body.description,
    }
    const section = await Section.findByIdAndUpdate(id, data, { new: true });
    if (section) {
        console.log('success update');
        return res.redirect(`/admin/category?category=${req.query.category}&year=${req.query.year}&semester=${req.query.semester}`)
    }
}

module.exports.delete = async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid subjectId:', id);
        return res.status(404).render('404', { role: 'admin' });
    }
    if (!req.query.category || !req.query.year || !req.query.semester) {
        console.log('Query fields are empty');
        req.flash('message', 'Query fields are empty');
        return res.status(404).render('404', { role: 'admin' });
    }
    const studentClass = await StudentClass.find({ sectionId: id });
    if (studentClass.length > 0) {
        req.flash('message', 'Cannot be deleted. There are student enrolled to this section.');
        return res.redirect(`/admin/category?category=${req.query.category}&year=${req.query.year}&semester=${req.query.semester}`)
    }
    const section = await Section.findById(id);
    if (section && section.subjects && section.subjects.length > 0) {
        req.flash('message', 'Section cannot be deleted if there are subjects assigned.');
        return res.redirect(`/admin/category?category=${req.query.category}&year=${req.query.year}&semester=${req.query.semester}`);
    }
    const deletedSection = await Section.findByIdAndDelete(id);
    if (deletedSection) {
        return res.redirect(`/admin/category?category=${req.query.category}&year=${req.query.year}&semester=${req.query.semester}`)
    }
    return res.status(404).render('404', { role: 'admin' });
}