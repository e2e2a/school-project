require('dotenv').config();
const mongoose = require("mongoose");
const dbConnect = require('../database/dbConnect');
const seedUsers = require("./user-seeder");
const seedCourses = require("./course-seeder");
const seedSections = require("./section-seeder");

(async () => {
    try {
        await dbConnect();

        await seedUsers();
        await seedCourses();
        await seedSections();

        mongoose.disconnect();

        console.log('Seed data created successfully');
    } catch (error) {
        console.error('Error seeding data:', error);
    }
})();
