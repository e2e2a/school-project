const User = require('../../models/user')
const StudentProfile = require('../../models/studentProfile')
const ProfessorProfile = require('../../models/professorProfile')
const SITE_TITLE = 'DSF';
const UserToken = require('../../models/userToken');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { customAlphabet } = require('nanoid');
const sixDigitCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
const bcrypt = require('bcrypt')

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
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'emonawong22@gmail.com',
                pass: 'nouv heik zbln qkhf',
            },
        });
        const sendEmail = async (from, to, subject, htmlContent) => {
            try {
                const mailOptions = {
                    from,
                    to,
                    subject,
                    html: htmlContent,
                };
                const info = await transporter.sendMail(mailOptions);
                console.log('Email sent:', info.response);
            } catch (error) {
                console.error('Error sending email:', error);
                return res.status(500).render('500');
            }
        };
        const actions = req.body.actions;
        const userLogin = await User.findById(req.session.login);
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
                const professorProfile = await ProfessorProfile.findOneAndUpdate({ userId: userLogin._id }, newData, { new: true });
                if (professorProfile) {
                    req.flash('message', 'Updated Profile Successfully!');
                    return res.redirect('/professor');
                } else {
                    req.flash('message', 'Failed to Update Successfully!');
                    return res.redirect('/professor');
                }
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
            const existingEmail = await User.findOne({ email: emailToChange })
            if (userLogin.email === emailToChange) {
                console.log('You are already using this email.');
                return res.redirect('/professor/profile');
            }
            if (existingEmail) {
                if (existingEmail.isVerified) {
                    console.log('Email is already used. Try another email.');
                    return res.redirect('/professor/profile');
                } else {
                    await User.findByIdAndDelete(existingEmail._id)
                    console.log('deleted')
                    const registrationToken = jwt.sign({ userId: userLogin._id }, 'Reymond_Godoy_Secret7777', { expiresIn: '1d' });
                    const verificationCode = sixDigitCode();
                    const userToken = new UserToken({
                        userId: userLogin._id,
                        token: registrationToken,
                        verificationCode: verificationCode,
                        expirationDate: new Date(new Date().getTime() + 24 * 5 * 60 * 1000),
                        expirationCodeDate: new Date(new Date().getTime() + 5 * 60 * 1000)
                    });
                    await userToken.save();

                    const verificationLink = `http://example.onrender.com/verify?token=${registrationToken}`;
                    const emailContent = `
                    <div style="text-align: center;">
                        <div style="background-color: #36393f; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); display: inline-block;">
                            <h2 style="color: #66c0f4;">Hello ${userLogin.email},</h2>
                            <p style="color: #dcddde;">Welcome aboard!</p>
                            <p style="color: #dcddde;">To unlock all the features our platform offers, please verify your email address by clicking the link below:</p>
                            <p style="color: #dcddde;">Your unique verification code is: <strong>${verificationCode}</strong></p>
                            <p style="color: #dcddde;">By verifying your email, you're helping us maintain a secure environment for all our users.</p>
                            <p style="color: #dcddde;">This process ensures that your account remains accessible only to you, safeguarding your data and privacy.</p>
                            <p style="color: #dcddde;">If you have any questions or encounter any issues, our support team is here to assist you.</p>
                        </div>
                    </div>
                        `;
                    sendEmail(
                        'example.onrender.com <school@gmail.com>',
                        userLogin.email,
                        'Verify your new email',
                        emailContent
                    );
                    console.log(userLogin.email)
                    req.session.emailToChange = emailToChange;
                    console.log('Verification email sent. Please verify your email to complete registration.');
                    return res.redirect(`/verify/email?token=${registrationToken}&sendcode=true`,);
                }
            } else {
                const registrationToken = jwt.sign({ userId: userLogin._id }, 'Reymond_Godoy_Secret7777', { expiresIn: '1d' });
                const verificationCode = sixDigitCode();
                const userToken = new UserToken({
                    userId: userLogin._id,
                    token: registrationToken,
                    verificationCode: verificationCode,
                    expirationDate: new Date(new Date().getTime() + 24 * 5 * 60 * 1000),
                    expirationCodeDate: new Date(new Date().getTime() + 5 * 60 * 1000)
                });
                await userToken.save();

                const emailContent = `
                    <div style="text-align: center;">
                        <div style="background-color: #36393f; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); display: inline-block;">
                            <h2 style="color: #66c0f4;">Hello ${userLogin.email},</h2>
                            <p style="color: #dcddde;">Welcome aboard!</p>
                            <p style="color: #dcddde;">To unlock all the features our platform offers, please verify your email address by clicking the link below:</p>
                            <p style="color: #dcddde;">Your unique verification code is: <strong>${verificationCode}</strong></p>
                            <p style="color: #dcddde;">By verifying your email, you're helping us maintain a secure environment for all our users.</p>
                            <p style="color: #dcddde;">This process ensures that your account remains accessible only to you, safeguarding your data and privacy.</p>
                            <p style="color: #dcddde;">If you have any questions or encounter any issues, our support team is here to assist you.</p>
                        </div>
                    </div>
                        `;
                sendEmail(
                    'example.onrender.com <school@gmail.com>',
                    userLogin.email,
                    'Verify your new email',
                    emailContent
                );
                console.log(userLogin.email)
                req.session.emailToChange = emailToChange;
                console.log('Verification email sent. Please verify your new email to complete registration.');
                return res.redirect(`/verify/email?token=${registrationToken}&sendcode=true`,);
            }
        } else if (actions === 'changePassword') {
            if (!req.body.currentPassword || !req.body.newPassword || !req.body.confirmPassword) {
                console.log('required field are empty');
                req.flash('message', 'Required field are empty');
                return res.status(404).render('404', { role: 'professor' });
            }
            const userLogin = await User.findById(req.session.login);
            const currentPassword = req.body.currentPassword;
            const newPassword = req.body.newPassword;
            const confirmPassword = req.body.confirmPassword;

            userLogin.comparePassword(currentPassword, async (error, valid) => {
                if (error) {
                    return res.status(403).send('Forbidden'); // 403 Forbidden
                }
                if (!valid) {
                    // 400 Bad Request
                    req.flash('error', 'Invalid password.');
                    console.log('password not match in userLogin.password')
                    return res.redirect('/professor/profile');
                }
                // Hash the new password before updating it in the database
                if (newPassword !== confirmPassword) {
                    console.log('new password is not equal to re-type password')
                    return res.redirect('/professor/profile')
                }
                const hashedNewPassword = await bcrypt.hash(newPassword, 10);

                // Update the password in the database
                userLogin.password = hashedNewPassword;
                await User.findOneAndUpdate(userLogin._id, { password: hashedNewPassword }, { new: true })

                console.log('Password changed successfully')
                return res.redirect('/professor/profile');
            });
        } else {
            console.log('forbidden');
        }
    } catch (error) {
        console.log('error:', error);
    }
}