const User = require('../../models/user')
const StudentProfile = require('../../models/studentProfile')
const SITE_TITLE = 'DSF';
const bcrypt = require('bcrypt');
const { sendEmail, emailContentEditEmail } = require('../../helper/controllers/auth/emailSender');
const { userToken } = require('../../helper/controllers/auth/userToken');

module.exports.index = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    const studentProfile = await StudentProfile.findOne({ userId: userLogin._id });
    res.render('user/profile', {
        site_title: SITE_TITLE,
        title: 'Profile',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        userLogin: userLogin,
        req: req,
        studentProfile: studentProfile,
    });
}

module.exports.update = async (req, res) => {
    const actions = req.body.actions;
    const user = await User.findById(req.session.login);
    if (actions === 'profile') {
        const { firstname, middlename, lastname, numberStreet, barangay, district, cityMunicipality, province, region, emailFbAcc, contact, nationality, sex, civilStatus, employmentStatus, birthdate, age, birthPlaceCity, birthPlaceProvince, birthPlaceRegion, educationAttainment, learnerOrTraineeOrStudentClassification } = req.body;

        if (!firstname || !middlename || !lastname || !numberStreet || !barangay || !district || !cityMunicipality || !province || !region || !emailFbAcc || !contact || !nationality || !sex || !civilStatus || !employmentStatus || !birthdate || !age || !birthPlaceCity || !birthPlaceProvince || !birthPlaceRegion || !educationAttainment || !learnerOrTraineeOrStudentClassification) {
            console.log('One or more required fields are empty');
            req.flash('message', 'Required fields are empty');
            return res.status(404).render('404', { role: 'student' });
        }
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
        await StudentProfile.findOneAndUpdate({ userId: user._id }, newData, { new: true });
        req.flash('message', 'Updated Profile Successfully!');
        return res.redirect('/student');
    } else if (actions === 'changeEmail') {
        const emailToChange = req.body.email;
        if (!emailToChange) {
            console.log('required field are empty');
            req.flash('message', 'Required field are empty');
            return res.status(404).render('404', { role: 'student' });
        }
        const existingEmail = await User.findOne({ email: emailToChange })
        if (user.email === emailToChange) {
            console.log('You are already using this email.');
            req.flash('message', 'You are already using this email.');
            return res.redirect('/profile');
        }
        if (existingEmail) {
            if (existingEmail.isVerified) {
                console.log('Email is already used. Try another email.');
                req.flash('message', 'Email is already used. Try another email.');
                return res.redirect('/profile');
            } else {
                await User.findByIdAndDelete(existingEmail._id)
                const tokenObject = await userToken(user);
                const emailHtmlContent = await emailContentEditEmail(user, tokenObject);
                sendEmail(
                    'example.onrender.com <school@gmail.com>',
                    user.email,
                    'Verify your new email',
                    emailHtmlContent
                );
                req.session.emailToChange = emailToChange;
                return res.redirect(`/verify/email?token=${tokenObject.token}&sendcode=true`,);
            }
        } else {
            const tokenObject = await userToken(user);
            const emailHtmlContent = await emailContentEditEmail(user, tokenObject);
            sendEmail(
                'example.onrender.com <school@gmail.com>',
                user.email,
                'Verify your new email',
                emailHtmlContent
            );
            req.session.emailToChange = emailToChange;
            return res.redirect(`/verify/email?token=${tokenObject.token}&sendcode=true`,);
        }
    } else if (actions === 'changePassword') {
        const user = await User.findById(req.session.login);
        if (!req.body.currentPassword || !req.body.newPassword || !req.body.confirmPassword) {
            req.flash('message', 'Required field are empty');
            return res.status(404).render('404', { role: 'student' });
        }
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;

        user.comparePassword(currentPassword, async (error, valid) => {
            if (error) {
                return res.status(403).send('Forbidden');
            }
            if (!valid) {
                req.flash('message', 'Current password does not match.');
                return res.redirect('/profile');
            }
            if (newPassword !== confirmPassword) {
                req.flash('message', 'New password is not equal to re-type password');
                return res.redirect('/profile')
            }
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            await User.findOneAndUpdate(user._id, { password: hashedNewPassword }, { new: true })
            req.flash('message', 'Password changed successfully');
            return res.redirect('/profile');
        });
    }
}