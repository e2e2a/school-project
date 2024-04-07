const User = require('../../models/user')
const Course = require('../../models/course');
const Section = require('../../models/section');
const SITE_TITLE = 'DSF';
const mongoose = require('mongoose');

module.exports.index = async (req, res) => {
    const courses = await Course.find();
    const coursesSidebar = await Course.find();
    res.render('admin/courseView', {
        site_title: SITE_TITLE,
        title: 'Course',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        courses: courses,
        coursesSidebar: coursesSidebar,
    });
}

module.exports.create = async (req, res) => {
    const coursesSidebar = await Course.find();
    res.render('admin/courseAdd', {
        site_title: SITE_TITLE,
        title: 'Course',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        coursesSidebar: coursesSidebar,
    });
}

module.exports.doCreate = async (req, res) => {
    const existingCourse = await Course.findOne({ category: req.body.category })
    if (existingCourse) {
        console.log('course is already created. please check the category.');
        req.flash('message', 'Course is already Created. Please check the course list.');
        return res.redirect('/admin/course/add');
    }
    const course = new Course({
        name: req.body.name,
        category: req.body.category,
        description: req.body.description,
    });
    await course.save();
    console.log('course save');
    return res.redirect('/admin/course/add')
}

module.exports.edit = async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid subjectId:', id);
        return res.status(404).render('404', { role: 'admin' });
    }
    const course = await Course.findById(id);
    const coursesSidebar = await Course.find();
    res.render('admin/courseEdit', {
        site_title: SITE_TITLE,
        title: 'Course',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        course: course,
        coursesSidebar: coursesSidebar,
    });
}

module.exports.doEdit = async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid courseId:', id);
        return res.status(404).render('404', { role: 'admin' });
    }
    const course = await Course.findById(id);
    const sections = await Section.find({ courseId: course._id });
    if (sections && sections.length > 0) {
        req.flash('message', 'Course editing is not possible while there are corresponding sections associated with this course.');
        return res.redirect(`/admin/course/edit/${course._id}`);
    }
    const data = {
        name: req.body.name,
        category: req.body.category,
        description: req.body.description,
    }
    await Course.findByIdAndUpdate(course._id, data, { new: true });
    req.flash('message', 'Course updated successfully.');
    return res.redirect(`/admin/courses`);
}

module.exports.delete = async (req, res) => {
    const courseId = req.body.courseId;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        console.log('Invalid courseId:', courseId);
        return res.status(404).render('404', { role: 'admin' });
    }
    const course = await Course.findById(courseId);
    const sections = await Section.find({ courseId: course._id });
    if (sections && sections.length > 0) {
        req.flash('message', 'Course deleting is not possible while there are corresponding sections associated with this course.');
        return res.redirect(`/admin/courses`);
    }
    await Course.findByIdAndUpdate(course._id);
    req.flash('message', 'Course deleted successfully.');
    return res.redirect(`/admin/courses`);
}