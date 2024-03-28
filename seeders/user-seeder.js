const bcrypt = require("bcrypt");
const User = require("../models/user");
const AdminProfile = require("../models/adminProfile");
const StudentProfile = require("../models/studentProfile");
const ProfessorProfile = require("../models/professorProfile");

async function seedUsers() {
    for (let i = 0; i < 10; i++) {
        const admin = new User({
            email: `admin${i}@example.com`,
            password: bcrypt.hashSync('password', 10),
            role: 'admin'
        });
        await admin.save();
        const adminProfile = new AdminProfile({
            userId: admin._id,
            isVerified: false
        });
        await adminProfile.save();
    }

    // Seed 10 students
    for (let i = 0; i < 10; i++) {
        const student = new User({
            email: `student${i}@example.com`,
            password: bcrypt.hashSync('password', 10),
            role: 'student'
        });
        await student.save();
        const studentProfile = new StudentProfile({
            userId: student._id,
            isVerified: false
        });
        await studentProfile.save();
    }

    // Seed 10 professors
    for (let i = 0; i < 10; i++) {
        const professor = new User({
            email: `professor${i}@example.com`,
            password: bcrypt.hashSync('password', 10),
            role: 'professor'
        });
        await professor.save();
        const professorProfile = new ProfessorProfile({
            userId: professor._id,
            isVerified: false
        });
        await professorProfile.save();
    }
}

module.exports = seedUsers;
