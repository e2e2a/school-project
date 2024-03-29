const User = require('../../models/user')
const Subject = require('../../models/subject');
const Course = require('../../models/course');
const StudentClass = require('../../models/studentClass');
const Section = require('../../models/section');
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
    const course = await Course.findById(req.body.courseId)
    if (course) {
        const checkSection = await Section.findOne({
            courseId: req.body.courseId,
            year: req.body.year,
            semester: req.body.semester,
            section: req.body.section
        });
        if (checkSection) {
            const subject = new Subject({
                subjectCode: req.body.subjectCode,
                name: req.body.name,
                unit: req.body.unit,
                year: req.body.year,
                semester: req.body.semester,
                section: req.body.section,
                description: req.body.description,
            });
            await subject.save();
            console.log('subject created.');
            checkSection.subjects.push({ subjectId: subject._id });
            try {
                await checkSection.save();
                console.log('Subject added to section.');
                return res.redirect('/admin/subject/add');
            } catch (error) {
                console.error('Error saving section:', error);
                return res.redirect('/admin/subject/add');
            }
        } else {
            console.log('A Section didnt exist. Please check the sections list.');
            return res.redirect('/admin/subject/add')
        }
    } else {
        console.log('no courses found.please check the course name.')
        return res.redirect('/admin/subject/add')
    }
} 