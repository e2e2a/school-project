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
    const coursesSidebar = await Course.find();
    res.render('admin/userStudentView', {
        site_title: SITE_TITLE,
        title: 'Users',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        studentProfiles: studentProfiles,
        coursesSidebar: coursesSidebar,
    });
}
module.exports.professor = async (req, res) => {
    const professorProfiles = await ProfessorProfile.find().populate('userId');
    const coursesSidebar = await Course.find();
    res.render('admin/userProfessorView', {
        site_title: SITE_TITLE,
        title: 'Users',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        professorProfiles: professorProfiles,
        coursesSidebar: coursesSidebar,
    });
}
module.exports.admin = async (req, res) => {
    const adminProfiles = await AdminProfile.find().populate('userId');
    const coursesSidebar = await Course.find();
    res.render('admin/userAdminView', {
        site_title: SITE_TITLE,
        title: 'Users',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        req: req,
        adminProfiles: adminProfiles,
        coursesSidebar: coursesSidebar,
    });
}

module.exports.edit = async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid ObjectId:', id);
        return res.redirect('/admin');
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
            return res.status(404).render('404', { role: 'admin' });
    }

    if (profile) {
        const coursesSidebar = await Course.find();
        res.render('admin/userEdit', {
            site_title: SITE_TITLE,
            title: 'User Edit',
            messages: req.flash(),
            currentUrl: req.originalUrl,
            req: req,
            profile: profile,
            coursesSidebar: coursesSidebar,
        });
    } else {
        console.log('Profile not found for ID:', id);
        return res.status(404).render('404', { role: 'admin' });
    }
};

module.exports.doEdit = async (req, res) => {
    const actions = req.body.actions;
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid params ObjectId:', id);
        return res.redirect('/admin');
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
            return res.status(404).render('404', { role: 'admin' });
    }
    if (actions === 'changeEmail') {
        if (profile.userId.role === 'student') {
            if (!req.body.email) {
                console.log('required field are empty');
                req.flash('message', 'Required field are empty');
                return res.status(404).render('404', { role: 'admin' });
            }
            const emailToChange = req.body.email;
            if (profile.email === emailToChange) {
                console.log('You are already using this email.');
                req.flash('message', 'You are already using this email.');
                return res.redirect(`/admin/user/${profile.userId.role}/list`);
            }
            const user = await User.findOne({ email: emailToChange });
            if (user) {
                if (user.isVerified) {
                    console.log('Email is already used. Try another email.');
                    req.flash('message', 'Email is already used. Try another email.');
                    return res.redirect(`/admin/user/${profile.userId.role}/list`);
                }
                await User.findByIdAndDelete(user._id)
            }
            const newData = {
                email: emailToChange,
                isVerified: true
            };
            const updatedUser = await User.findByIdAndUpdate(profile.userId, newData, { new: true });
            req.flash('message', 'Updated profile success.');
            return res.redirect(`/admin/user/${profile.userId.role}/list`);
        } else if (profile.userId.role === 'professor') {
            const emailToChange = req.body.email;
            if (!req.body.email) {
                console.log('required field are empty');
                req.flash('message', 'Required field are empty');
                return res.status(404).render('404', { role: 'admin' });
            }
            if (profile.email === emailToChange) {
                console.log('You are already using this email.');
                req.flash('message', 'You are already using this email.');
                return res.redirect(`/admin/user/${profile.userId.role}/list`);
            }
            const user = await User.findOne({ email: emailToChange });
            if (user) {
                if (user.isVerified) {
                    console.log('Email is already used. Try another email.');
                    req.flash('message', 'Email is already used. Try another email.');
                    return res.redirect(`/admin/user/${profile.userId.role}/list`);
                }
                await User.findByIdAndDelete(user._id)
            }
            const newData = {
                email: emailToChange,
                isVerified: true
            };
            const updatedUser = await User.findByIdAndUpdate(profile.userId, newData, { new: true });
            req.flash('message', 'Updated profile success.');
            return res.redirect(`/admin/user/${profile.userId.role}/list`);
        } else if (profile.userId.role === 'admin') {
            const emailToChange = req.body.email;
            if (!req.body.email) {
                console.log('required field are empty');
                req.flash('message', 'Required field are empty');
                return res.status(404).render('404', { role: 'admin' });
            }
            if (profile.email === emailToChange) {
                console.log('You are already using this email.');
                req.flash('message', 'You are already using this email.');
                return res.redirect(`/admin/user/${profile.userId.role}/list`);
            }
            const user = await User.findOne({ email: emailToChange });
            if (user) {
                if (user.isVerified) {
                    console.log('Email is already used. Try another email.');
                    req.flash('message', 'Email is already used. Try another email.');
                    return res.redirect(`/admin/user/${profile.userId.role}/list`);
                }
                await User.findByIdAndDelete(user._id)
            }
            const newData = {
                email: emailToChange,
                isVerified: true
            };
            const updatedUser = await User.findByIdAndUpdate(profile.userId, newData, { new: true });
            req.flash('message', 'Updated profile success.');
            return res.redirect(`/admin/user/${profile.userId.role}/list`);
        } else {
            console.log('forbidden');
        }
    } else if (actions === 'changePassword') {
        if (profile.userId.role === 'student') {
            if (!req.body.currentPassword || !req.body.newPassword || !req.body.confirmPassword) {
                console.log('required field are empty');
                req.flash('message', 'Required field are empty');
                return res.status(404).render('404', { role: 'admin' });
            }
            const newPassword = req.body.newPassword;
            const confirmPassword = req.body.confirmPassword;
            if (newPassword !== confirmPassword) {
                console.log('new password is not equal to re-type password');
                req.flash('message', 'New password is not equal to re-type password.');
                return res.redirect(`/admin/user/${profile.userId.role}/list`);
            }
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            const newData = {
                password: hashedNewPassword,
                isVerified: true
            };
            const updatedUser = await User.findByIdAndUpdate(profile.userId, newData, { new: true });
            req.flash('message', 'Password Change Successfully.');
            return res.redirect(`/admin/user/${profile.userId.role}/list`);
        } else if (profile.userId.role === 'professor') {
            if (!req.body.currentPassword || !req.body.newPassword || !req.body.confirmPassword) {
                console.log('required field are empty');
                req.flash('message', 'Required field are empty');
                return res.status(404).render('404', { role: 'admin' });
            }
            const newPassword = req.body.newPassword;
            const confirmPassword = req.body.confirmPassword;
            if (newPassword !== confirmPassword) {
                console.log('new password is not equal to re-type password');
                req.flash('message', 'New password is not equal to re-type password.');
                return res.redirect(`/admin/user/${profile.userId.role}/list`);
            }
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            const newData = {
                password: hashedNewPassword,
                isVerified: true
            };
            const updatedUser = await User.findByIdAndUpdate(profile.userId, newData, { new: true });
            req.flash('message', 'Password Change Successfully.');
            return res.redirect(`/admin/user/${profile.userId.role}/list`);
        } else if (profile.userId.role === 'admin') {
            if (!req.body.currentPassword || !req.body.newPassword || !req.body.confirmPassword) {
                console.log('required field are empty');
                req.flash('message', 'Required field are empty');
                return res.status(404).render('404', { role: 'admin' });
            }
            const newPassword = req.body.newPassword;
            const confirmPassword = req.body.confirmPassword;
            if (newPassword !== confirmPassword) {
                console.log('new password is not equal to re-type password');
                req.flash('message', 'New password is not equal to re-type password.');
                return res.redirect(`/admin/user/${profile.userId.role}/list`);
            }
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            const newData = {
                password: hashedNewPassword,
                isVerified: true
            };
            const updatedUser = await User.findByIdAndUpdate(profile.userId, newData, { new: true });
            req.flash('message', 'Password Change Successfully.');
            return res.redirect(`/admin/user/${profile.userId.role}/list`);
        } else {
            console.log('forbidden')
        }
    } else if (actions === 'changeProfile') {
        if (profile.userId.role === 'student') {
            const { firstname, middlename, lastname, numberStreet, barangay, district, cityMunicipality, province, region, emailFbAcc, contact, nationality, sex, civilStatus, employmentStatus, birthdate, age, birthPlaceCity, birthPlaceProvince, birthPlaceRegion, educationAttainment, learnerOrTraineeOrStudentClassification } = req.body;

            if (!firstname || !middlename || !lastname || !numberStreet || !barangay || !district || !cityMunicipality || !province || !region || !emailFbAcc || !contact || !nationality || !sex || !civilStatus || !employmentStatus || !birthdate || !age || !birthPlaceCity || !birthPlaceProvince || !birthPlaceRegion || !educationAttainment || !learnerOrTraineeOrStudentClassification) {
                console.log('One or more required fields are empty');
                req.flash('message', 'Required fields are empty');
                return res.redirect(`/admin/user/edit/${profile._id}/${profile.userId.role}`);
            }
            const [birthYear, birthMonth, birthDay] = birthdate.split('-');
            const newData = {
                firstname: firstname,
                middlename: middlename,
                lastname: lastname,
                numberStreet: numberStreet,
                barangay: barangay,
                district: district,
                cityMunicipality: cityMunicipality,
                province: province,
                region: region,
                emailFbAcc: emailFbAcc,
                contact: contact,
                nationality: nationality,
                sex: sex,
                civilStatus: civilStatus,
                employmentStatus: employmentStatus,
                birthMonth: birthMonth,
                birthDay: birthDay,
                birthYear: birthYear,
                age: age,
                birthPlaceCity: birthPlaceCity,
                birthPlaceProvince: birthPlaceProvince,
                birthPlaceRegion: birthPlaceRegion,
                educationAttainment: educationAttainment,
                learnerOrTraineeOrStudentClassification: learnerOrTraineeOrStudentClassification,
                isVerified: true
            };
            const profileUpdate = await StudentProfile.findByIdAndUpdate(profile._id, newData, { new: true });
            req.flash('message', 'Profile updated successfully');
            return res.redirect(`/admin/user/${profile.userId.role}/list`);
        } else if (profile.userId.role === 'professor') {
            const { firstname, middlename, lastname, contact, birthdate, age } = req.body;

            if (!firstname || !middlename || !lastname || !contact || !birthdate || !age) {
                console.log('One or more required fields are empty');
                req.flash('message', 'Required fields are empty');
                return res.redirect(`/admin/user/edit/${profile._id}/${profile.userId.role}`);
            }
            const [birthYear, birthMonth, birthDay] = birthdate.split('-');
            const newData = {
                firstname: firstname,
                middlename: middlename,
                lastname: lastname,
                contact: contact,
                birthMonth: birthMonth,
                birthDay: birthDay,
                birthYear: birthYear,
                age: age,
                isVerified: true
            };
            await ProfessorProfile.findByIdAndUpdate(profile._id, newData, { new: true });
            req.flash('message', 'Profile updated successfully');
            return res.redirect(`/admin/user/${profile.userId.role}/list`);
        } else if (profile.userId.role === 'admin') {
            const { firstname, middlename, lastname, contact, birthdate } = req.body;

            if (!firstname || !middlename || !lastname || !contact || !birthdate) {
                console.log('One or more required fields are empty');
                req.flash('message', 'Required fields are empty');
                return res.redirect(`/admin/user/edit/${profile._id}/${profile.userId.role}`);
            }
            const [birthYear, birthMonth, birthDay] = birthdate.split('-');
            const newData = {
                firstname: firstname,
                middlename: middlename,
                lastname: lastname,
                contact: contact,
                birthMonth: birthMonth,
                birthDay: birthDay,
                birthYear: birthYear,
                isVerified: true
            };
            const profileUpdate = await AdminProfile.findByIdAndUpdate(profile._id, newData, { new: true });
            req.flash('message', 'Profile updated successfully');
            return res.redirect(`/admin/user/${profile.userId.role}/list`);
        } else {
            console.log('forbidden1');
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