const User = require('../../models/user')
const Subject = require('../../models/subject');
const Course = require('../../models/course');
const StudentClass = require('../../models/studentClass');
const StudentProfile = require('../../models/studentProfile');
const ProfessorProfile = require('../../models/professorProfile');
const AdminProfile = require('../../models/adminProfile');
const Section = require('../../models/section');
const mongoose = require('mongoose');
const SITE_TITLE = 'DSF';


module.exports.student = async (req, res) => {
    const studentProfiles = await StudentProfile.find().populate('userId');
    res.render('admin/userStudentView', {
        site_title: SITE_TITLE,
        title: 'User',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        studentProfiles: studentProfiles,
    });
}
module.exports.professor = async (req, res) => {
    const professorProfiles = await ProfessorProfile.find().populate('userId');
    res.render('admin/userProfessorView', {
        site_title: SITE_TITLE,
        title: 'User',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        professorProfiles: professorProfiles,
    });
}
module.exports.admin = async (req, res) => {
    const adminProfiles = await AdminProfile.find().populate('userId');
    res.render('admin/userAdminView', {
        site_title: SITE_TITLE,
        title: 'User',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        adminProfiles: adminProfiles,
    });
}

module.exports.edit = async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid ObjectId:', id);
        return res.status(404).render('404');
    }

    const role = req.params.role;
    let profile;

    switch (role) {
        case 'student':
            profile = await StudentProfile.findById(id).populate('userId');
            break;
        case 'professor':
            profile = await ProfessorProfile.findById(id).populate('userId');
            break;
        case 'admin':
            profile = await AdminProfile.findById(id).populate('userId');
            break;
        default:
            console.log('Role not recognized:', role);
            return res.status(404).render('404');
    }

    if (profile) {
        res.render('admin/userEdit', {
            site_title: SITE_TITLE,
            title: 'User',
            messages: req.flash(),
            currentUrl: req.originalUrl,
            req: req,
            profile: profile,
        });
    } else {
        console.log('Profile not found for ID:', id);
        return res.status(404).render('404');
    }
};

module.exports.doEdit = async (req, res) => {
    const actions = req.body.actions;
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid ObjectId:', id);
        return res.status(404).render('404');
    }

    const role = req.params.role;
    let profile;

    switch (role) {
        case 'student':
            profile = await StudentProfile.findById(id).populate('userId');
            break;
        case 'professor':
            profile = await ProfessorProfile.findById(id).populate('userId');
            break;
        case 'admin':
            profile = await AdminProfile.findById(id).populate('userId');
            break;
        default:
            console.log('Role not recognized:', role);
            return res.status(404).render('404');
    }
    if (actions === 'changeEmail') {
        console.log('changeEmail')

    } else if (actions === 'changePassword') {
        console.log('changePassword')
    } else if (actions === 'changeProfile') {
        if (profile.userId.role === 'student') {
            const birthdate = req.body.birthdate;
            const [birthYear, birthMonth, birthDay] = birthdate.split('-');
            const newData = {
                firstname: req.body.firstname,
                middlename: req.body.middlename,
                lastname: req.body.lastname,
                numberStreet: req.body.numberStreet,
                barangay: req.body.barangay,
                district: req.body.district,
                cityMunicipality: req.body.cityMunicipality,
                province: req.body.province,
                region: req.body.region,
                emailFbAcc: req.body.emailFbAcc,
                contact: req.body.contact,
                nationality: req.body.nationality,
                sex: req.body.sex,
                civilStatus: req.body.civilStatus,
                employmentStatus: req.body.employmentStatus,
                birthMonth: birthMonth,
                birthDay: birthDay,
                birthYear: birthYear,
                age: req.body.age,
                birthPlaceCity: req.body.birthPlaceCity,
                birthPlaceProvince: req.body.birthPlaceProvince,
                birthPlaceRegion: req.body.birthPlaceRegion,
                educationAttainment: req.body.educationAttainment,
                learnerOrTraineeOrStudentClassification: req.body.learnerOrTraineeOrStudentClassification,
                isVerified: true
            };
            const profile = await StudentProfile.findByIdAndUpdate(profile._id, newData, { new: true });
            return res.redirect(`/admin/user/${profile.userId.role}/list`);
        } else if (profile.userId.role === 'professor') {
            const birthdate = req.body.birthdate;
            const [birthYear, birthMonth, birthDay] = birthdate.split('-');
            const newData = {
                firstname: req.body.firstname,
                middlename: req.body.middlename,
                lastname: req.body.lastname,
                contact: req.body.contact,
                birthMonth: birthMonth,
                birthDay: birthDay,
                birthYear: birthYear,
                isVerified: true
            };
            const profile = await ProfessorProfile.findByIdAndUpdate(profile._id, newData, { new: true });
            return res.redirect(`/admin/user/${profile.userId.role}/list`);
        } else if (profile.userId.role === 'admin') {
            const birthdate = req.body.birthdate;
            const [birthYear, birthMonth, birthDay] = birthdate.split('-');
            const newData = {
                firstname: req.body.firstname,
                middlename: req.body.middlename,
                lastname: req.body.lastname,
                contact: req.body.contact,
                birthMonth: birthMonth,
                birthDay: birthDay,
                birthYear: birthYear,
                isVerified: true
            };
            const profile = await AdminProfile.findByIdAndUpdate(profile._id, newData, { new: true });
            return res.redirect(`/admin/user/${profile.userId.role}/list`);
        } else{
            console.log('forbidden');
        }
    } else {
        console.log('forbidden');
    }

}

module.exports.create = async (req, res) => {
    res.render('admin/userAdd', {
        site_title: SITE_TITLE,
        title: 'User',
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