const Section = require('../models/section');
const Course = require('../models/course');

async function seedSections() {
    const categories = ['DPFT', 'DPTHT', 'DPIT', 'DPET', 'DPWT'];

    for (let category of categories) {
        const course = await Course.findOne({ category: category });
        if (course) {
            for (let year = 1; year <= 3; year++) {
                for (let semester = 1; semester <= 2; semester++) {
                    for (let section = 1; section <= 2; section++) {
                        const existingSection = await Section.findOne({
                            courseId: course._id,
                            year: `${year}${year === 1 ? 'st' : year === 2 ? 'nd' : 'rd'} Year`,
                            semester: `${semester}${semester === 1 ? 'st' : 'nd'} Semester`,
                            section: `Section ${section}`
                        });
                        if (!existingSection) {
                            const newSection = new Section({
                                courseId: course._id,
                                year: `${year}${year === 1 ? 'st' : year === 2 ? 'nd' : 'rd'} Year`,
                                semester: `${semester}${semester === 1 ? 'st' : 'nd'} Semester`,
                                section: `Section ${section}`,
                                description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
                            });
                            await newSection.save();
                        }
                    }
                }
            }
        }
    }
}

module.exports = seedSections;