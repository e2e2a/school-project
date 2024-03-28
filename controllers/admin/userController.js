const User = require('../../models/user')
const Subject = require('../../models/subject');
const Course = require('../../models/course');
const StudentClass = require('../../models/studentClass');
const StudentProfile = require('../../models/studentProfile');
const ProfessorProfile = require('../../models/professorProfile');
const AdminProfile = require('../../models/adminProfile');
const Section = require('../../models/section');
const SITE_TITLE = 'DSF';

module.exports.index = async (req, res) => {
    res.render('admin/userAdd', {
        site_title: SITE_TITLE,
        title: 'Subject',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
    });
}

module.exports.doCreate = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            if (existingUser.isVerified) {
                req.flash('message', 'Email Already Used!');
                return res.redirect('/admin/user/add');
            } else {
                if (password !== confirmPassword) {
                    req.flash('message', 'Password does not match.');
                    return res.redirect('/admin/user/add');
                }
                const hashedPassword = await bcrypt.hash(password, 10);
                const userUpdate = {
                    email: email,
                    role: req.body.role,
                    password: hashedPassword,
                    isVerified: true,
                };
                const updatedUser = await User.findByIdAndUpdate(existingUser._id, userUpdate, { new: true });
                if (updatedUser.role === 'student') {
                    const studentProfile = new StudentProfile({
                        userId: updatedUser._id,
                        isVerified: false
                    });
                    await studentProfile.save();
                    console.log('studentProfile created')
                } else if (updatedUser.role === 'professor') {
                    const professorProfile = new ProfessorProfile({
                        userId: updatedUser._id,
                        isVerified: false
                    });
                    await professorProfile.save();
                    console.log('professorProfile created')
                } else if (updatedUser.role === 'admin') {
                    const adminProfile = new AdminProfile({
                        userId: updatedUser._id,
                        isVerified: false
                    });
                    await adminProfile.save();
                    console.log('adminProfile created')
                }
                if (updatedUser) {
                    console.log('user created success!.')
                    return res.redirect(`/admin/user/add`);
                } else {
                    console.log('user create failed!.')
                    return res.redirect(`/admin/user/add`);
                }
            }
        } else {
            if (password !== confirmPassword) {
                req.flash('message', 'Password does not match.');
                return res.redirect('/admin/user/add');
            }
            const user = new User({
                email: req.body.email,
                role: req.body.role,
                password: req.body.password,
                isVerified: true,
            });
            if (user.role === 'student') {
                const studentProfile = new StudentProfile({
                    userId: user._id,
                    isVerified: false
                });
                await studentProfile.save();
                console.log('studentProfile created')
            } else if (user.role === 'professor') {
                const professorProfile = new ProfessorProfile({
                    userId: user._id,
                    isVerified: false
                });
                await professorProfile.save();
                console.log('professorProfile created')
            } else if (user.role === 'admin') {
                const adminProfile = new AdminProfile({
                    userId: user._id,
                    isVerified: false
                });
                await adminProfile.save();
                console.log('adminProfile created')
            }
            await user.save();
            return res.redirect(`/admin/user/add`);
        }
    } catch (error) {
        console.error('Registration failed:', error);
        return res.status(500).render('500');
    }
}