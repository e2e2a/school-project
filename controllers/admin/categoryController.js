const User = require('../../models/user')
const Subject = require('../../models/subject');
const Course = require('../../models/course');
const StudentProfile = require('../../models/studentProfile');
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
    sections.forEach(section => {
        console.log(`Subjects for Section ${section.section}:`, section.subjects);
    });

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
                console.log('days', days)
                try {
                    // Find the section
                    let sectionExists = await Section.findOne(sectionFilter);
                    if (!sectionExists) {
                        console.log('Section not found');
                        return res.status(400).send('Section not found');
                    }
                    console.log('Section found');

                    let schedule = await Schedule.findOne({ sectionId: sectionExists._id, professorId:professorId });
                    if (!schedule) {
                        schedule = new Schedule({ professorId: professorId, sectionId: sectionExists._id, schedule: [] });
                        console.log('Schedule not found for professor');
                    }

                    // Check if the subject exists in the schedule
                    const subjectIndex = schedule.schedule.findIndex(entry => entry.subjectId.toString() === subjectId);
                    function getTimeInMinutes(time) {
                        const [hour, minute] = time.split(':').map(Number);
                        return hour * 60 + minute;
                    }

                    // Check if the provided time range is valid
                    const isTimeValid = getTimeInMinutes(startTime) < getTimeInMinutes(endTime);

                    if (!isTimeValid) {
                        console.log('Invalid time range');
                        return res.status(400).send('Invalid time range');
                    }
                    const daysArray = Array.isArray(days) ? days : [days];
                    const isOverlapping = schedule.schedule.some(existingSchedule => {
                        if (existingSchedule.subjectId.toString() !== subjectId) {
                            const overlapDays = daysArray.filter(day => existingSchedule.days.includes(day));
                            if (overlapDays.length > 0) {
                                const newStartTime = getTimeInMinutes(startTime);
                                const newEndTime = getTimeInMinutes(endTime);
                                const existingStartTime = getTimeInMinutes(existingSchedule.startTime);
                                const existingEndTime = getTimeInMinutes(existingSchedule.endTime);

                                // Check if the new schedule overlaps with the existing schedule's days
                                if (
                                    existingSchedule.days.some(day => overlapDays.includes(day)) ||
                                    overlapDays.some(day => existingSchedule.days.includes(day))
                                ) {
                                    // Check if the new schedule starts immediately after the existing schedule ends or ends immediately before the existing schedule starts
                                    if (
                                        (newStartTime === existingEndTime && newEndTime > existingStartTime) ||
                                        (newEndTime === existingStartTime && newStartTime < existingEndTime)
                                    ) {
                                        console.log(newEndTime, existingStartTime, newStartTime ,existingEndTime)
                                        return false; 
                                    }

                                    // Check if the new schedule starts before the existing schedule ends or ends after the existing schedule starts
                                    if (
                                        (newStartTime < existingEndTime && newEndTime > existingStartTime) ||
                                        // Allow new schedule if it starts exactly when existing schedule ends or ends exactly when existing schedule starts
                                        (newStartTime === existingEndTime || newEndTime === existingStartTime)
                                    ) {
                                        return true; // Overlapping schedules found
                                    }
                                }
                            }
                        }
                        return false;
                    });

                    if (isOverlapping) {
                        console.log('Professor is not available during the specified time');
                        return res.status(400).send('Professor is not available during the specified time');
                    }
                    if (subjectIndex !== -1) {
                        // Subject found, update it
                        const updatedSubject = schedule.schedule[subjectIndex];

                        // Update the subject with the new days, start time, and end time from the request body
                        updatedSubject.days = days;
                        updatedSubject.startTime = startTime;
                        updatedSubject.endTime = endTime;
                    } else {
                        // Subject not found, create a new entry
                        schedule.schedule.push({
                            subjectId,
                            days,
                            startTime,
                            endTime
                        });
                    }
                    // Update the schedule in the Schedule model
                    await schedule.save();

                    // Update or create the subject entry in sectionExists.subjects
                    let subjectToUpdate = sectionExists.subjects.find(sub => sub.subjectId.toString() === subjectId);
                    if (subjectToUpdate) {
                        // Subject found, update it
                        subjectToUpdate.professorId = professorId;
                        subjectToUpdate.days = days;
                        subjectToUpdate.startTime = startTime;
                        subjectToUpdate.endTime = endTime;
                    } else {
                        // Subject not found, create a new entry
                        sectionExists.subjects.push({
                            subjectId,
                            professorId,
                            days,
                            startTime,
                            endTime
                        });
                    }

                    // Save the updated section
                    await sectionExists.save();
                    console.log('save')

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
