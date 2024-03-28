const bcrypt = require("bcrypt");
const User = require("../models/user");
const AdminProfile = require("../models/adminProfile");
const StudentProfile = require("../models/studentProfile");
const ProfessorProfile = require("../models/professorProfile");

async function seedUsers() {
    for (let i = 0; i < 10; i++) {
        const adminEmail = `admin${i}@example.com`;
        const adminExists = await User.findOne({ email: adminEmail });
        if (!adminExists) {
            const admin = new User({
                email: adminEmail,
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
    }

    for (let i = 0; i < 10; i++) {
        const studentEmail = `student${i}@example.com`;
        const studentExists = await User.findOne({ email: studentEmail });
        if (!studentExists) {
            const student = new User({
                email: studentEmail,
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
    }

    for (let i = 0; i < 10; i++) {
        const professorEmail = `professor${i}@example.com`;
        const professorExists = await User.findOne({ email: professorEmail });
        if (!professorExists) {
            const professor = new User({
                email: professorEmail,
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
}


module.exports = seedUsers;
