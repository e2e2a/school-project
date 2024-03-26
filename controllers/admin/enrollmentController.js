const User = require('../../models/user')
const Course = require('../../models/course');
const StudentClass = require('../../models/studentClass');
const StudentProfile = require('../../models/studentProfile');
const Section = require('../../models/section');
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    const studentProfiles = await StudentProfile.find().populate('courseId')
    res.render('admin/enrollmentView', {
        site_title: SITE_TITLE,
        title: 'Enrollments',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        studentProfiles: studentProfiles,
    });
}
module.exports.doEnroll = async (req, res) => {
    try {
        const actions = req.body.actions;
        if (actions === 'approved') {
            const studentId = req.body.studentId;
            const studentProfile = await StudentProfile.findById(studentId);
            if (studentProfile) {
                const checkSection = await Section.findOne({
                    courseId: req.body.courseId,
                    year: req.body.year,
                    semester: req.body.semester,
                    section: req.body.section
                });
                if (checkSection) {
                    const studentClass = new StudentClass({
                        studentId: studentProfile._id,
                        courseId: studentProfile.courseId,
                        sectionId: checkSection._id
                    });
                    console.log('student', studentClass)
                    await studentClass.save();
                    await StudentProfile.findByIdAndUpdate(studentProfile._id, { isEnrolled: true }, { new: true });
                    console.log('student class save.');
                    return res.redirect('/admin/enrollments');
                } else {
                    console.log('no section found to enroll.');
                    return res.redirect('/admin/enrollments');
                }
            } else {
                console.log('no student found.');
            }
        } else if (actions === 'declined') {
            console.log('e')
        }
    } catch (error) {
        console.log('error', error);
    }

}