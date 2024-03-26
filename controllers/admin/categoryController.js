const User = require('../../models/user')
const Subject = require('../../models/subject');
const Course = require('../../models/course');
const StudentProfile = require('../../models/studentProfile');
const Section = require('../../models/section');
const Schedule = require('../../models/schedule');
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
            category: category,
            year: year,
            semester: semester,
        });
    } else {
        console.log('no sections found!.')
    }
}

module.exports.actions = async (req, res) => {
    const actions = req.body.actions;
    if (actions === 'update') {
        try {
            const { category, year, semester, link } = req.query;
            if (category && year && semester) {
                const { subjectId, professorId, startTime, endTime , section} = req.body;
                const sections = await Section.find({ semester, year, section, 'subjects.subjectId': subjectId }).populate('courseId').exec();
                const filteredSections = sections.filter(section => {
                    return section.courseId && section.courseId.category === category;
                });
                for (const section of filteredSections) {
                    const subject = section.subjects.find(sub => sub.subjectId.toString() === subjectId);
                    if (subject) {
                        subject.professorId = professorId;
                        subject.startTime = startTime;
                        subject.endTime = endTime;
                    }
                }
                await Promise.all(filteredSections.map(section => section.save()));
                let existingSchedules = await Schedule.findOne({ professorId });

                if (!existingSchedules) {
                    existingSchedules = new Schedule({ professorId, schedule: [] });
                }

                // Check if the new schedule overlaps with any existing schedule
                const isOverlapping = existingSchedules.schedule.some(existingSchedule => {
                    const existingStartTime = existingSchedule.startTime;
                    const existingEndTime = existingSchedule.endTime;

                    // Check if the new schedule completely overlaps with the existing schedule
                    return (startTime <= existingStartTime && endTime >= existingEndTime) ||
                        (startTime >= existingStartTime && startTime <= existingEndTime) ||
                        (endTime >= existingStartTime && endTime <= existingEndTime);
                });

                if (isOverlapping) {
                    console.log('Professor is not available during the specified time');
                    return res.status(400).send('Professor is not available during the specified time');
                }

                existingSchedules.schedule.push({ subjectId, startTime, endTime });
                console.log(existingSchedules.schedule)
                await existingSchedules.save();
                res.redirect(`/admin/category?category=${category}&year=${year}&semester=${semester}`);
            }
        } catch (error) {
            console.error('Error saving schedule:', error);
            res.status(500).send('Error saving schedule');
        }

    }
}
