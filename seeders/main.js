require('dotenv').config();
const mongoose = require("mongoose");
const seedUsers = require("./user-seeder");
const dbConnect = require('../database/dbConnect');

// Connect to MongoDB
const conn = dbConnect();

// Call the seed function from seeder.js
seedUsers()
    .then(() => {
        console.log('Seed data created successfully');
        // Disconnect from MongoDB
        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Error seeding data:', err);
    });
