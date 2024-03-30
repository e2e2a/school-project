const User = require('../../models/user')
const Subject = require('../../models/subject');
const Course = require('../../models/course');
const StudentProfile = require('../../models/studentProfile');
const StudentClass = require('../../models/studentClass');
const ProfessorProfile = require('../../models/professorProfile');
const Section = require('../../models/section');
const Schedule = require('../../models/schedule');
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    const category = req.query.category;
    const year = req.query.year;
    const semester = req.query.semester;
    const sections = await Section.find({
        category: category,
        year: year,
        semester: semester,
    }).populate('courseId').populate('subjects.subjectId').populate('subjects.professorId').exec();
    // Filter sections based on category

    const professors = await ProfessorProfile.find().populate('userId').exec();

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
    });
}

module.exports.actions = async (req, res) => {
    const actions = req.body.actions;
    if (actions === 'update') {
        try {
            const { category, year, semester, link } = req.query;
            if (category && year && semester) {
                const { subjectId, professorId, startTime, endTime, section, days } = req.body;
                const sectionFilter = { category, semester, year, section };

                try {
                    // Find the section
                    let sectionExists = await Section.findOne(sectionFilter);
                    if (!sectionExists) {
                        console.log('Section not found');
                        return res.status(400).send('Section not found');
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
                        return res.status(400).send('Invalid time range');
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
                        return res.status(400).send('Professor is not available during the specified time');
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
                            } 
                            await currentStudentClass.save();
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
                    console.log('Schedule saved successfully');
                    res.redirect(`/admin/category?category=${category}&year=${year}&semester=${semester}`);
                } catch (error) {
                    console.error('Error saving schedule:', error);
                    res.status(500).send('Error saving schedule');
                }
            }
        } catch (error) {
            console.error('Error saving schedule:', error);
            res.status(500).send('Error saving schedule');
        }
    }
}
