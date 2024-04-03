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
    const section = await Section.findById(sectionId);
    const studentClasses = await StudentClass.find({ sectionId: sectionId })
        .populate('studentId')
        .populate('subjects.professorId')
        .populate('subjects.subjectId');
    

    for (const studentClass of studentClasses) {
        const { studentId, courseName, category, year, semester, section, subjects, batch} = studentClass;
        const prospectusSubjects = subjects.map(subject => {
            const professor = subject.professorId;
            const subjectId = subject.subjectId;
            const professorName = {
                lastname: professor.lastname,
                firstname: professor.firstname,
                middlename: professor.middlename
            };

            return {
                subject: {
                    subjectCode: subjectId.subjectCode,
                    name: subjectId.name,
                    unit: subjectId.unit
                },
                professorName: professorName,
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
            batch,
            subjects: prospectusSubjects,
        });

        await prospectus.save();
    }

    console.log('Prospectus documents created successfully');
    res.redirect(`/admin/category?category=${section.category}&year=${section.year}&semester=${section.semester}`);
};
