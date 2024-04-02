const Course = require('../../models/course');
const StudentClass = require('../../models/studentClass');
const ProfessorProfile = require('../../models/professorProfile');
const Section = require('../../models/section');
const Schedule = require('../../models/schedule');
const Prospectus = require('../../models/prospectus');
const mongoose = require('mongoose');
const SITE_TITLE = 'DSF';

module.exports.endSemester = async (req, res) => {
    const sectionId = req.body.sectionId;
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        console.log('Invalid ObjectId:', sectionId);
        req.flash('message', 'Invalid sectionId.');
        return res.status(404).render('404');
    }
    const section = await Section.findById(sectionId)
    const studentClasses = await StudentClass.find({ sectionId: sectionId })
        .populate('studentId')
        .populate('subjects.professorId');

    for (const studentClass of studentClasses) {
        const {
            studentId,
            courseName,
            category,
            year,
            semester,
            section,
            subjects,
        } = studentClass;

        const prospectusSubjects = subjects.map(subject => {
            const professor = subject.professorId;
            return {
                subjectId: subject._id,
                professorName: {
                    lastname: professor.lastname,
                    firstname: professor.firstname,
                    middlename: professor.middlename
                },
                startTime: subject.startTime,
                endTime: subject.endTime,
                grade: subject.grade
            };
        });

        const prospectus = new Prospectus({
            studentId: studentId._id,
            studentName: {
                lastname: studentId.lastname,
                firstname: studentId.firstname,
                middlename: studentId.middlename
            },
            courseName,
            category,
            year,
            semester,
            section,
            subjects: prospectusSubjects,
        });

        await prospectus.save();
    }


    console.log('Prospectus documents created successfully');
    res.redirect(`/admin/category?category=${section.category}&year=${section.year}&semester=${section.semester}`);







    // if (studentProfile) {
    //     const courseId = req.body.courseId;
    //     if (!mongoose.Types.ObjectId.isValid(courseId)) {
    //         console.log('Invalid ObjectId:', courseId);
    //         req.flash('message', 'Invalid courseId.');
    //         return res.redirect('/admin/enrollments/enrolling');
    //     }
    //     const course = await Course.findById(courseId)
    //     const checkSection = await Section.findOne({
    //         courseId: course._id,
    //         year: req.body.year,
    //         semester: req.body.semester,
    //         section: req.body.section
    //     }).populate('subjects.subjectId');
    //     if (checkSection) {
    //         const subjects = checkSection.subjects.map(subject => ({
    //             subjectId: subject.subjectId,
    //             professorId: subject.professorId,
    //             startTime: subject.startTime,
    //             endTime: subject.endTime,
    //             grade: null
    //         }));

    //         const studentClass = new StudentClass({
    //             studentId: studentProfile._id,
    //             courseId: studentProfile.courseId,
    //             sectionId: checkSection._id,
    //             subjects: subjects,
    //             courseName: course.name,
    //             category: course.category,
    //             year: req.body.year,
    //             semester: req.body.semester,
    //             section: req.body.section,
    //             status: true,
    //         });
    //         console.log('student', studentClass)
    //         await studentClass.save();
    //         await StudentProfile.findByIdAndUpdate(studentProfile._id, { isEnrolled: true, isEnrolling: false }, { new: true });
    //         console.log('student class save.');
    //         req.flash('message', 'Student enrolled sucessfully.');
    //         return res.redirect('/admin/enrollments/enrolling');
    //     } else {
    //         console.log('no section found to enroll.');
    //         req.flash('message', 'No Section found to enroll the student.');
    //         return res.redirect('/admin/enrollments/enrolling');
    //     }
    // } else {
    //     console.log('no student found.');
    //     req.flash('message', 'No student found.');
    //     return res.redirect('/admin/enrollments/enrolling');
    // }
}