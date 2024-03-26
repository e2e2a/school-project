const User = require('../../models/user')
const Subject = require('../../models/subject');
const Course = require('../../models/course');
const Section = require('../../models/section');
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    const category = req.query.category;
    const year = req.query.year;
    const semester = req.query.semester;
    console.log('category',category,'year',year,'semester',semester)
    const sections = await Section.find({
        year: year,
        semester: semester,
    }).populate({
        path: 'courseId',
        match: { category: category }, 
    }).populate('subjects.subjectId');
    console.log(sections)
    if (sections.length > 0) {
        res.render('admin/categoryView', {
            site_title: SITE_TITLE,
            title: 'Category',
            messages: req.flash(),
            currentUrl: req.originalUrl,
            req: req,
            sections: sections,
        });
    }else{
        console.log('no sections found!.')
    }
}
