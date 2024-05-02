const User = require('../../models/user')
const StudentProfile = require('../../models/studentProfile')
const ProfessorProfile = require('../../models/professorProfile')
const SITE_TITLE = 'DSF';
const bcrypt = require('bcrypt')
const { sendEmail, emailContentEditEmail } = require('../../helper/controllers/auth/emailSender');
const { userToken } = require('../../helper/controllers/auth/userToken');

module.exports.index = async (req, res) => {
    const userLogin = await User.findById(req.session.login);
    const professorProfile = await ProfessorProfile.findOne({ userId: userLogin._id });
    res.render('professor/profile', {
        site_title: SITE_TITLE,
        title: 'Profile',
        messages: req.flash(),
        currentUrl: req.originalUrl,
        userLogin: userLogin,
        req: req,
        professorProfile: professorProfile,
    });
}

module.exports.update = async (req, res) => {
    const actions = req.body.actions;
    const user = await User.findById(req.session.login);
    if (actions === 'profile') {
        try {
            const { firstname, middlename, lastname, contact, birthdate, age } = req.body;

            if (!firstname || !middlename || !lastname || !contact || !birthdate || !age) {
                console.log('One or more required fields are empty');
                req.flash('message', 'Required fields are empty');
                return res.status(404).render('404', { role: 'professor' });
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
            await ProfessorProfile.findOneAndUpdate({ userId: user._id }, newData, { new: true });
            req.flash('message', 'Updated Profile Successfully!');
            return res.redirect('/professor');
        } catch (error) {
            console.log('error:', error)
            return res.status(500).render('500');
        }
    } else if (actions === 'changeEmail') {
        if (!req.body.email) {
            console.log('required field are empty');
            req.flash('message', 'Required field are empty');
            return res.status(404).render('404', { role: 'professor' });
        }
        const emailToChange = req.body.email;
        if (!/^[\w.-]+@gmail\.com$/.test(emailToChange)) {
            req.flash('error', 'Invalid email address. Please use a Gmail address.');
            return res.redirect('/professor/profile');
        }
        const existingEmail = await User.findOne({ email: emailToChange })
        if (userLogin.email === emailToChange) {
            console.log('You are already using this email.');
            req.flash('message', 'You are already using this email.');
            return res.redirect('/professor/profile');
        }
        if (existingEmail) {
            if (existingEmail.isVerified) {
                console.log('Email is already used. Try another email.');
                req.flash('message', 'Email is already used. Try another email.');
                return res.redirect('/professor/profile');
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
                return res.redirect(`/verify/email?token=${registrationToken}&sendcode=true`,);
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
            return res.redirect(`/verify/email?token=${registrationToken}&sendcode=true`,);
        }
    } else if (actions === 'changePassword') {
        if (!req.body.currentPassword || !req.body.newPassword || !req.body.confirmPassword) {
            console.log('required field are empty');
            req.flash('message', 'Required field are empty');
            return res.status(404).render('404', { role: 'professor' });
        }
        const user = await User.findById(req.session.login);
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;

        user.comparePassword(currentPassword, async (error, valid) => {
            if (error) {
                return res.status(403).send('Forbidden');
            }
            if (!valid) {
                req.flash('message', 'Current password does not match.');
                return res.redirect('/professor/profile');
            }
            if (newPassword !== confirmPassword) {
                req.flash('message', 'New password is not equal to re-type password');
                return res.redirect('/professor/profile')
            }
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            await User.findOneAndUpdate(user._id, { password: hashedNewPassword }, { new: true })
            req.flash('message', 'Password changed successfully');
            return res.redirect('/professor/profile');
        });
    }

}