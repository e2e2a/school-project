const User = require('../../models/user')
const Subject = require('../../models/subject');
const Course = require('../../models/course');
const StudentProfile = require('../../models/studentProfile');
const Section = require('../../models/section');
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    const category = req.query.category;
    const year = req.query.year;
    const semester = req.query.semester;
    const sections = await Section.find({
        year: year,
        semester: semester,
    }).populate('courseId').populate('subjects.subjectId').exec();
    
    // Filter sections based on category
    const filteredSections = sections.filter(section => {
        return section.courseId && section.courseId.category === category;
    });
    
    console.log(sections)
    const profProfile = await StudentProfile.find().populate('userId').exec();
    const professors = profProfile.filter(profile => profile.userId.role === 'professor');
    if (sections.length > 0) {
        res.render('admin/categoryView', {
            site_title: SITE_TITLE,
            title: 'Category',
            messages: req.flash(),
            currentUrl: req.originalUrl,
            req: req,
            filteredSections: filteredSections,
            professors: professors,
        });
    } else {
        console.log('no sections found!.')
    }
}
