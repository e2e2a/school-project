const User = require('../../models/user')
const Course = require('../../models/course');
const SITE_TITLE = 'DSF';

module.exports.index = async (req,res) => {
    res.render('admin/courseAdd', {
        site_title: SITE_TITLE,
        title: 'Course',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
    });
}
module.exports.doCreate = async (req,res) => {
    const existingCourse = await Course.findOne({category: req.body.category})
    if(existingCourse){
        console.log('course is already created. please check the category.');
        return res.redirect('/admin/course/add');
    }
    const course = new Course({
        name: req.body.name,
        category: req.body.category,
        description: req.body.description,
    });
    await course.save();
    console.log('save');
    return res.redirect('/admin/course/add')
} 

//finish add course
//then
//add section
//then loop the section in the s