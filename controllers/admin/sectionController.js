const User = require('../../models/user')
const Subject = require('../../models/subject');
const Course = require('../../models/course');
const Section = require('../../models/section');
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    const courses = await Course.find()
    res.render('admin/sectionAdd', {
        site_title: SITE_TITLE,
        title: 'Section',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        courses: courses,
    });
}
module.exports.doCreate = async (req, res) => {
    const course = await Course.findById(req.body.courseId)
    if (course) {
        const existingSection = await Section.findOne({
            courseId: req.body.courseId,
            year: req.body.year,
            semester: req.body.semester,
            section: req.body.section
        });
        if (existingSection) {
            console.log('A section with the same year, semester, and section already exists. Please check the sections list.');
            return res.redirect('/admin/section/add');
        }
        const section = new Section({
            courseId: req.body.courseId,
            year: req.body.year,
            semester: req.body.semester,
            section: req.body.section,
            description: req.body.description,
        });
        await section.save();
        console.log('Section created save.');
        return res.redirect('/admin/section/add');
    } else {
        console.log('no courses found.please check the course name.')
        return res.redirect('/admin/section/add');
    }
} 