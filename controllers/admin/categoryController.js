const User = require('../../models/user')
const Course = require('../../models/course');
const Subject = require('../../models/subject');
const StudentClass = require('../../models/studentClass');
const ProfessorProfile = require('../../models/professorProfile');
const Section = require('../../models/section');
const Schedule = require('../../models/schedule');
const mongoose = require('mongoose');
const AdminProfile = require('../../models/adminProfile');
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    const category = req.query.category;
    const year = req.query.year;
    const semester = req.query.semester;
    if (!category || !year || !semester || category.trim() === '' || year.trim() === '' || semester.trim() === '') {
        console.log('One or more parameters are missing or empty.');
        return res.status(404).render('404', { role: 'admin' });
    }
    const sections = await Section.find({
        category: category,
        year: year,
        semester: semester,
    }).populate('courseId').populate('subjects.subjectId').populate('subjects.professorId').exec();
    const professors = await ProfessorProfile.find().populate('userId').exec();
    const studentClass = await StudentClass.find()
    const coursesSidebar = await Course.find();
    const adminProfile = await AdminProfile.findOne({ userId: req.session.login });
    res.render('admin/categoryView', {
        site_title: SITE_TITLE,
        title: 'Category',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        filteredSections: sections,
        professors: professors,
        category: category,
        year: year,
        semester: semester,
        studentClass: studentClass,
        coursesSidebar: coursesSidebar,
        adminProfile: adminProfile,
    });
}

module.exports.actions = async (req, res) => {
    const actions = req.body.actions;
    if (actions === 'update') {
        const { category, year, semester, link } = req.query;
        if (category && year && semester) {
            const { subjectId, professorId, startTime, endTime, section, days } = req.body;
            if (!subjectId || !professorId || !startTime || !endTime || !section || !days) {
                console.log('Required fields are missing in the request body');
                req.flash('message', 'Please provide a professor, schedule and time.')
                return res.redirect(`/admin/category?category=${category}&year=${year}&semester=${semester}`);
            }
            const sectionFilter = { category, semester, year, section };
            if (!mongoose.Types.ObjectId.isValid(professorId)) {
                console.log('Invalid professorId:', professorId);
                return res.status(404).render('404', { role: 'admin' });
            }
            if (!mongoose.Types.ObjectId.isValid(subjectId)) {
                console.log('Invalid subjectId:', subjectId);
                return res.status(404).render('404', { role: 'admin' });
            }
            try {
                // Find the section
                let sectionExists = await Section.findOne(sectionFilter);
                if (!sectionExists) {
                    console.log('Section not found');
                    req.flash('message', 'Section not found');
                    return res.status(404).render('404', { role: 'admin' });
                }

                let professorSchedule = await Schedule.findOne({ professorId });
                if (!professorSchedule) {
                    professorSchedule = new Schedule({ professorId, schedule: [] });
                    console.log('Schedule not found for professor');
                }

                function getTimeInMinutes(time) {
                    const [hour, minute] = time.split(':').map(Number);
                    return hour * 60 + minute;
                }

                const isTimeValid = getTimeInMinutes(startTime) < getTimeInMinutes(endTime);
                if (!isTimeValid) {
                    console.log('Invalid time range');
                    req.flash('message', 'Invalid time range');
                    return res.redirect(`/admin/category?category=${category}&year=${year}&semester=${semester}`);
                }
                //
                const index = professorSchedule.schedule.findIndex(entry => entry.subjectId.toString() === subjectId);
                // If the subject is found in the professor's schedule, remove the existing entry
                if (index !== -1) {
                    professorSchedule.schedule.splice(index, 1);
                }
                //

                const isConflict = professorSchedule.schedule.some(existingSchedule => {
                    const overlapDays = Array.isArray(days) ? days.filter(day => existingSchedule.days.includes(day)) : [days];
                    if (overlapDays.length > 0) {
                        const newStartTime = getTimeInMinutes(startTime);
                        const newEndTime = getTimeInMinutes(endTime);
                        const existingStartTime = getTimeInMinutes(existingSchedule.startTime);
                        const existingEndTime = getTimeInMinutes(existingSchedule.endTime);

                        if (
                            (newStartTime === existingEndTime && newEndTime > existingStartTime) ||
                            (newEndTime === existingStartTime && newStartTime < existingEndTime)
                        ) {
                            console.log(newEndTime, existingStartTime, newStartTime, existingEndTime)
                            return false;
                        }

                        if (
                            (newStartTime < existingEndTime && newEndTime > existingStartTime) ||
                            (newStartTime === existingEndTime || newEndTime === existingStartTime)
                        ) {
                            return true;
                        }
                    }
                    return false;
                });

                if (isConflict) {
                    console.log('Professor is not available during the specified time');
                    req.flash('message', 'Professor is not available during the specified time')
                    return res.redirect(`/admin/category?category=${category}&year=${year}&semester=${semester}`);
                }

                professorSchedule.schedule.push({
                    subjectId,
                    days,
                    startTime,
                    endTime
                });

                await professorSchedule.save();
                //student class
                let studentClass = await StudentClass.find(sectionFilter);
                if (studentClass.length > 0) {
                    for (let i = 0; i < studentClass.length; i++) {
                        let currentStudentClass = studentClass[i];
                        let subjectToUpdateStudentClass = currentStudentClass.subjects.find(sub => sub.subjectId.toString() === subjectId);
                        if (subjectToUpdateStudentClass) {
                            // Subject found, update it
                            subjectToUpdateStudentClass.professorId = professorId;
                            subjectToUpdateStudentClass.days = days;
                            subjectToUpdateStudentClass.startTime = startTime;
                            subjectToUpdateStudentClass.endTime = endTime;
                            await currentStudentClass.save();
                        }
                    }
                }

                let subjectToUpdate = sectionExists.subjects.find(sub => sub.subjectId.toString() === subjectId);
                if (subjectToUpdate) {
                    // Subject found, update it
                    subjectToUpdate.professorId = professorId;
                    subjectToUpdate.days = days;
                    subjectToUpdate.startTime = startTime;
                    subjectToUpdate.endTime = endTime;
                } else {
                    sectionExists.subjects.push({
                        subjectId,
                        professorId,
                        days,
                        startTime,
                        endTime
                    });
                }

                await sectionExists.save();
                req.flash('message', 'Schedule saved successfully')
                res.redirect(`/admin/category?category=${category}&year=${year}&semester=${semester}`);
            } catch (error) {
                console.error('Error saving schedule:', error);
                res.status(500).send('Error saving schedule');
            }
        }
    } else if (actions === 'delete') {
        const id = req.body.subjectId;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log('Invalid subjectId:', id);
            return res.status(404).render('404', { role: 'admin' });
        }
        const sectionId = req.body.sectionId;
        if (!mongoose.Types.ObjectId.isValid(sectionId)) {
            console.log('Invalid subjectId:', sectionId);
            return res.status(404).render('404', { role: 'admin' });
        }
        const { category, year, semester, section } = req.query;
        if (!category || !year || !semester) {
            console.log('Query fields are empty');
            req.flash('message', 'Query fields are empty');
            return res.status(404).render('404', { role: 'admin' });
        }
        const course = await Course.findOne({ category: category });
        if (!course) {
            console.log('No courses found. Please check the course name.');
            req.flash('message', 'No courses found. Please check the course selected.');
            return res.status(404).render('404', { role: 'admin' });
        }
        const checkSection = await Section.findById(sectionId);
        console.log(checkSection)
        if (!checkSection) {
            console.log('A Section did not exist. Please check the sections list.');
            req.flash('message', 'A Section did not exist. Please check the sections list.');
            return res.status(404).render('404', { role: 'admin' });
        }
        try {
            const subject = await Subject.findById(id);
            const studentClasses = await StudentClass.find({ sectionId: checkSection._id });
            await Promise.all(studentClasses.map(async (studentClass) => {
                studentClass.subjects = studentClass.subjects.filter(sub => !sub.subjectId.equals(subject._id));
                await studentClass.save();
            }));

            const professorSchedules = await Schedule.find();
            await Promise.all(professorSchedules.map(async (schedule) => {
                if (schedule.schedule && Array.isArray(schedule.schedule)) {
                    schedule.schedule = schedule.schedule.filter(sub => !sub.subjectId.equals(subject._id));
                    await schedule.save();
                }
            }));

            checkSection.subjects = checkSection.subjects.filter(sub => !sub.subjectId.equals(subject._id));
            await checkSection.save();
            await Subject.findByIdAndDelete(id);
            console.log('Subject deleted from section.');
            req.flash('message', 'Subject deleted successfully.');
            return res.redirect(`/admin/category?category=${category}&year=${year}&semester=${semester}`);
        } catch (error) {
            console.error('Error deleting subject:', error);
            req.flash('message', 'An error occurred while deleting the subject.');
            return res.status(500).redirect(`/admin/category?category=${category}&year=${year}&semester=${semester}`);
        }
    }
}
