const User = require('../../models/user')
const StudentProfile = require('../../models/studentProfile');
const ProfessorProfile = require('../../models/professorProfile');
const Course = require('../../models/course');
const StudentClass = require('../../models/studentClass');
const Section = require('../../models/section');
const Schedule = require('../../models/schedule');
const mongoose = require('mongoose');
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        if (userLogin) {
            if (userLogin.role === 'professor') {
                const professorProfile = await ProfessorProfile.findOne({ userId: userLogin._id });
                const professorSchedule = await Schedule.findOne({ professorId: professorProfile._id }).populate('schedule.subjectId')
                    .populate({
                        path: 'schedule.subjectId',
                        populate: {
                            path: 'courseId',
                            model: 'Course'
                        }
                    });
                const studentClasses = await StudentClass.find({ 'subjects.professorId': professorProfile._id }).populate('subjects.subjectId').populate('studentId');
                res.render('professor/class', {
                    site_title: SITE_TITLE,
                    title: 'Class',
                    messages: req.flash(),
                    currentUrl: req.originalUrl,
                    userLogin: userLogin,
                    req: req,
                    professorProfile: professorProfile,
                    professorSchedule: professorSchedule,
                    studentClasses: studentClasses,
                });
            } else {
                return res.status(404).render('404');
            }
        } else {
            return res.redirect('/login');
        }
    } catch (error) {
        console.log('error:', error)
        return res.status(500).render('500');
    }
}

module.exports.doGrade = async (req, res) => {
    if (!req.body.grade) {
        console.log('required field are empty');
        req.flash('message', 'Grade field is empty');
        return res.redirect('/professor/class');
    }
    const grade = req.body.grade;
    const actions = req.body.actions
    const subjectId = req.body.subjectId
    const studentClassId = req.body.studentClassId;
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
        console.log('Invalid subjectId:', subjectId);
        return res.status(404).render('404');
    }
    if (!mongoose.Types.ObjectId.isValid(studentClassId)) {
        console.log('Invalid studentClassId:', studentClassId);
        return res.status(404).render('404');
    }
    if (actions === 'update') {
        const studentClass = await StudentClass.findById(studentClassId)
        if (!studentClass) {
            console.log('forbidden student class not found');
            return res.redirect('/professor/class')
        }
        const subject = studentClass.subjects.find(sub => sub._id.toString() === subjectId);
        if (!subject) {
            console.log('Subject not found in student class');
            return res.redirect('/professor/class');
        }

        subject.grade = grade;
        await studentClass.save();
        console.log('student class update the grade successfully!.');
        return res.redirect('/professor/class')
    }
}