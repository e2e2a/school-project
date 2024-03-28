const Subject = require('../models/subject');
const Section = require('../models/section');
const Course = require('../models/course');

async function seedSubjects() {
    const subjectsData = [
        { name: 'Subject 1', unit: 3, year: '1st Year', semester: '1st Semester' , section: 'Section 1' , description: 'Description of Subject 1' },
        //{ name: 'Subject 2', unit: 3, year: '1st Year', semester: '1st Semester' , section: 'Section 1' , description: 'Description of Subject 1' },
        // { name: 'Subject 3', unit: 3, year: '1st Year', semester: '1st Semester' , section: 'Section 2' , description: 'Description of Subject 1' },
        // { name: 'Subject 4', unit: 3, year: '1st Year', semester: '1st Semester' , section: 'Section 2' , description: 'Description of Subject 1' },
        // { name: 'Subject 5', unit: 3, year: '1st Year', semester: '2nd Semester' , section: 'Section 1' , description: 'Description of Subject 1' },
        // { name: 'Subject 6', unit: 3, year: '1st Year', semester: '2nd Semester' , section: 'Section 1' , description: 'Description of Subject 1' },
        // { name: 'Subject 7', unit: 3, year: '1st Year', semester: '2nd Semester' , section: 'Section 2' , description: 'Description of Subject 1' },
        // { name: 'Subject 8', unit: 3, year: '1st Year', semester: '2nd Semester' , section: 'Section 2' , description: 'Description of Subject 1' },
        // { name: 'Subject 9', unit: 3, year: '2nd Year', semester: '1st Semester' , section: 'Section 1' , description: 'Description of Subject 1' },
        // { name: 'Subject 10', unit: 3, year: '2nd Year', semester: '1st Semester' , section: 'Section 1' , description: 'Description of Subject 1' },
        // { name: 'Subject 11', unit: 3, year: '2nd Year', semester: '1st Semester' , section: 'Section 2' , description: 'Description of Subject 1' },
        // { name: 'Subject 12', unit: 3, year: '2nd Year', semester: '1st Semester' , section: 'Section 2' , description: 'Description of Subject 1' },
        // { name: 'Subject 13', unit: 3, year: '2nd Year', semester: '2nd Semester' , section: 'Section 1' , description: 'Description of Subject 1' },
        // { name: 'Subject 14', unit: 3, year: '2nd Year', semester: '2nd Semester' , section: 'Section 1' , description: 'Description of Subject 1' },
        // { name: 'Subject 15', unit: 3, year: '2nd Year', semester: '2nd Semester' , section: 'Section 2' , description: 'Description of Subject 1' },
        // { name: 'Subject 16', unit: 3, year: '2nd Year', semester: '2nd Semester' , section: 'Section 2' , description: 'Description of Subject 1' },
        // { name: 'Subject 17', unit: 3, year: '3rd Year', semester: '1st Semester' , section: 'Section 1' , description: 'Description of Subject 1' },
        // { name: 'Subject 18', unit: 3, year: '3rd Year', semester: '1st Semester' , section: 'Section 1' , description: 'Description of Subject 1' },
        // { name: 'Subject 19', unit: 3, year: '3rd Year', semester: '1st Semester' , section: 'Section 2' , description: 'Description of Subject 1' },
        // { name: 'Subject 20', unit: 3, year: '3rd Year', semester: '1st Semester' , section: 'Section 2' , description: 'Description of Subject 1' },
        // { name: 'Subject 21', unit: 3, year: '3rd Year', semester: '2nd Semester' , section: 'Section 1' , description: 'Description of Subject 1' },
        // { name: 'Subject 22', unit: 3, year: '3rd Year', semester: '2nd Semester' , section: 'Section 1' , description: 'Description of Subject 1' },
        // { name: 'Subject 23', unit: 3, year: '3rd Year', semester: '2nd Semester' , section: 'Section 2' , description: 'Description of Subject 1' },
        // { name: 'Subject 24', unit: 3, year: '3rd Year', semester: '2nd Semester' , section: 'Section 2' , description: 'Description of Subject 1' },
    ];

    const courses = await Course.find();
    for (let course of courses) {
        for (let subjectData of subjectsData) {
            const existingSubject = await Subject.findOne({
                name: subjectData.name,
                year: subjectData.year,
                semester: subjectData.semester,
                section: subjectData.section
            });

            if (!existingSubject) {
                const subject = new Subject({
                    name: subjectData.name,
                    unit: subjectData.unit,
                    year: subjectData.year,
                    semester: subjectData.semester,
                    section: subjectData.section,
                    description: subjectData.description
                });
                await subject.save();
                
                const section = await Section.findOne({
                    courseId: course._id,
                    year: subjectData.year,
                    semester: subjectData.semester,
                    section: subjectData.section
                });
                
                section.subjects.push({ subjectId: subject._id });
                await section.save();
                console.log('section:', section)
            }
        }
    }
}

module.exports = seedSubjects;
