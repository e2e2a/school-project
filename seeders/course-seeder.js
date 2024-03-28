const Course = require('../models/course');

async function seedCourses() {
    const coursesData = [
        {
            name: `Diploma Program in Fishery Technology`,
            category: 'DPFT',
            description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. '
        },
        {
            name: `Diploma Program in Tourism and Hospitality Technology`,
            category: 'DPTHT',
            description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. '
        },
        {
            name: `Diploma Program in Information Technology`,
            category: 'DPIT',
            description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. '
        },
        {
            name: `Diploma Program in Electrical Technology`,
            category: 'DPET',
            description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. '
        },
        {
            name: `Diploma Program in Welding Technology`,
            category: 'DPWT',
            description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. '
        }
    ];

    for (let i = 0; i < coursesData.length; i++) {
        const { name , category } = coursesData[i];
        const courseExists = await Course.findOne({ name: name, category: category });
        if (!courseExists) {
            const course = new Course(coursesData[i]);
            await course.save();
        }
    }
}

module.exports = seedCourses;
