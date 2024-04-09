const SITE_TITLE = 'shope';
const User = require('../../../models/user');
const UserToken = require('../../../models/userToken');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { customAlphabet } = require('nanoid');
const sixDigitCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
const StudentProfile = require('../../../models/studentProfile');
const bcrypt = require('bcrypt');

module.exports.index = async (req, res) => {
    res.render('auth/forgot_password/emailForgotPassword', {
        site_title: SITE_TITLE,
        title: 'Verify',
        session: req.session,
        currentUrl: req.originalUrl,
        messages: req.flash(),
    });
}
module.exports.email = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
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
    if (user) {
        const registrationToken = jwt.sign({ userId: user._id }, 'Reymond_Godoy_Secret7777', { expiresIn: '1d' });
        const verificationCode = sixDigitCode();
        const userToken = new UserToken({
            userId: user._id,
            token: registrationToken,
            verificationCode: verificationCode,
            expirationDate: new Date(new Date().getTime() + 24 * 5 * 60 * 1000),
            expirationCodeDate: new Date(new Date().getTime() + 5 * 60 * 1000) // 5 mins expiration
        });
        await userToken.save();
        const emailContent = `
            <div style="text-align: center;">
                <div style="background-color: #36393f; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); display: inline-block;">
                    <h2 style="color: #66c0f4;">Hello ${user.email},</h2>
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
            'example.onrender.com <example@gmail.com>',
            user.email,
            'Verify your email',
            emailContent
        );
        req.session.email = user.email;
        console.log(req.session.email)
        console.log('Verification email sent. Please verify your email to complete registration.');
        return res.redirect(`/email/verify?token=${registrationToken}&sendcode=true`,);
    } else {
        console.log('no email found');
        return res.redirect('/email')
    }
}

module.exports.verify = async (req, res) => {
    try {
        const verificationToken = req.query.token;
        const sendcode = req.query.sendcode === 'true';
        const userLogin = await User.findById(req.session.login)
        if (!verificationToken) {
            return res.redirect('/register')
        }
        const userToken = await UserToken.findOne({ token: verificationToken });
        if (!userToken) {
            return res.redirect('/register')
        }
        const expirationCodeDate = userToken.expirationCodeDate;
        const remainingTimeInSeconds = Math.floor((expirationCodeDate - new Date().getTime()) / 1000);
        if (!userToken || userToken.expirationDate < new Date()) {
            return res.redirect('/register')
        }
        const user = await User.findOne({ email: req.session.email });
        res.render('auth/forgot_password/verifyEmail', {
            site_title: SITE_TITLE,
            title: 'Verify',
            session: req.session,
            currentUrl: req.originalUrl,
            adjustedExpirationTimestamp: remainingTimeInSeconds,
            userToken: userToken,
            sendcode: sendcode,
            user: user,
            messages: req.flash(),
        });
    } catch (error) {
        console.error('Error rendering verification input form:', error);
        return res.status(500).render('500');
    }
};

module.exports.doVerify = async (req, res) => {
    var action = req.body.action;
    const verificationToken = req.body.token;
    if (action === 'submit') {
        try {
            const verificationCode = req.body.verificationCode;
            const decodedToken = jwt.verify(verificationToken, 'Reymond_Godoy_Secret7777');
            // Checking
            const userToken = await UserToken.findOne({ userId: decodedToken.userId, token: verificationToken });
            console.log(userToken.verificationCode)
            if (userToken && userToken.expirationDate > new Date()) {
                if (verificationCode === userToken.verificationCode) {
                    if (userToken.expirationCodeDate > new Date()) {
                        const user = await User.findOne({ email: req.session.email });
                        await UserToken.findByIdAndUpdate(userToken._id, { isVerified: true }, { new: true })
                        res.redirect(`/new/password/verify?token=${verificationToken}`);
                    } else {
                        console.log('Code expired', userToken.expirationCodeDate);
                        req.flash('error', 'Code has been expired.');
                        res.redirect(`/email/verify?token=${verificationToken}`);
                    }
                } else {
                    console.log('Verification code does not match');
                    req.flash('error', 'The code does not match.');
                    res.redirect(`/email/verify?token=${verificationToken}`);
                }
            } else {
                console.log('Invalid or expired verification code.');
                const userLogin = await User.findById(req.session.login)
                return res.status(404).render('404', {
                    login: req.session.login,
                    userLogin: userLogin,
                });
            }
        } catch (error) {
            console.error('Verification failed:', error);
            return res.status(500).render('500');
        }
    } else if (action === 'resend') {
        try {
            const decodedToken = jwt.verify(verificationToken, 'Reymond_Godoy_Secret7777');
            const userToken = await UserToken.findOne({ userId: decodedToken.userId, token: verificationToken });
            const user = await User.findById({ _id: userToken.userId });
            if (userToken) {
                console.log(user._id);
                const verificationCode = sixDigitCode();
                if (verificationToken === userToken.token) {
                    const updateCode = {
                        verificationCode: verificationCode,
                        expirationCodeDate: new Date(new Date().getTime() + 5 * 60 * 1000),
                    };
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'emonawong22@gmail.com',
                            pass: 'nouv heik zbln qkhf',
                        },
                    });
                    // Function to send an email
                    const sendEmail = async (from, to, subject, htmlContent) => {
                        try {
                            const mailOptions = {
                                from,
                                to,
                                subject,
                                html: htmlContent,  // Set the HTML content
                            };
                            const info = await transporter.sendMail(mailOptions);
                            console.log('Email sent:', info.response);
                        } catch (error) {
                            console.error('Error sending email:', error);
                            return res.status(500).render('500');
                        }
                    };
                    // link
                    const verificationLink = `http://example.onrender.com/verify?token=${verificationToken}`;
                    const emailContent = `
                    <div style="text-align: center;">
                        <div style="background-color: #36393f; padding: 20px; width: 70%; text-align: justify; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); display: inline-block;">
                            <h2 style="color: #66c0f4;">Hello ${req.session.email},</h2>
                            <p style="color: #dcddde;">Welcome to our platform!</p>
                            <p style="color: #dcddde;">We've just sent a new email to your address.</p>
                            <p style="color: #dcddde;">Please verify your new email address.</p>
                            <p style="color: #dcddde;">Your unique verification code is: <strong>${verificationCode}</strong></p>
                            <p style="color: #dcddde;">By verifying your email, you're helping us maintain a secure environment for all our users.</p>
                            <p style="color: #dcddde;">This process ensures that your account remains accessible only to you, safeguarding your data and privacy.</p>
                            <p style="color: #dcddde;">If you have any questions or encounter any issues, our support team is here to assist you.</p>
                        </div>
                    </div>`;
                    sendEmail(
                        'example.onrender.com <example@gmail.com>',
                        req.session.email,
                        'New Verification Code for your New Email',
                        emailContent
                    );
                    console.log('Code Resend Successfully!');
                    const updatedCode = await UserToken.findByIdAndUpdate(userToken._id, updateCode, {
                        new: true
                    });
                    if (updatedCode) {
                        console.log('code has been updated', updatedCode);
                        console.log(user);
                        res.redirect(`/email/verify?token=${verificationToken}&sendcode=true`);
                    } else {
                        console.log('Error updating code: Code not found or update unsuccessful');
                    }
                } else {
                    // Codes in req.body do not match
                    console.log('Verification codes do not match.');
                    const userLogin = await User.findById(req.session.login)
                    return res.status(404).render('404', {
                        login: req.session.login,
                        userLogin: userLogin,
                    });
                }
            }
        } catch (err) {
            console.log('no token', err);
            return res.status(500).render('500');
        }
    } else if (action === 'cancel') {
        const decodedToken = jwt.verify(verificationToken, 'Reymond_Godoy_Secret7777');
        const userToken = await UserToken.findOne({ userId: decodedToken.userId, token: verificationToken });
        try {
            await User.findByIdAndDelete(decodedToken.userId);
            await UserToken.findByIdAndDelete(userToken._id);
            res.redirect('/register')
        } catch (error) {
            console.error('Deletion error:', error.message);
            return res.status(500).render('500');
        }
    } else {
        //this must be status 400 invalid action
        return res.status(500).render('500');
    }
};

module.exports.newPassword = async (req, res) => {
    try {
        const verificationToken = req.query.token;
        if (!verificationToken) {
            return res.redirect('/register')
        }
        const userToken = await UserToken.findOne({ token: verificationToken });
        if (!userToken) {
            return res.redirect('/register')
        }
        if (userToken.isVerified) {
            const expirationCodeDate = userToken.expirationCodeDate;
            const remainingTimeInSeconds = Math.floor((expirationCodeDate - new Date().getTime()) / 1000);
            if (!userToken || userToken.expirationDate < new Date()) {
                return res.redirect('/register')
            }
            const user = await User.findOne({ email: req.session.email });
            res.render('auth/forgot_password/forgot_password', {
                site_title: SITE_TITLE,
                title: 'New Password',
                session: req.session,
                currentUrl: req.originalUrl,
                adjustedExpirationTimestamp: remainingTimeInSeconds,
                userToken: userToken,
                user: user,
                messages: req.flash(),
            });
        } else {
            return res.redirect('/register');
        }
    } catch (error) {
        console.error('Error rendering verification input form:', error);
        return res.status(500).render('500');
    }
};

module.exports.doNewPassword = async (req, res) => {
    try {
        const verificationToken = req.body.token;
        const verificationCode = req.body.verificationCode;
        const decodedToken = jwt.verify(verificationToken, 'Reymond_Godoy_Secret7777');
        // Checking
        const userToken = await UserToken.findOne({ userId: decodedToken.userId, token: verificationToken });
        console.log(userToken.verificationCode)
        if (userToken && userToken.expirationDate > new Date()) {
            const newPassword = req.body.newPassword;
            const confirmPassword = req.body.confirmPassword;

            if(newPassword !== confirmPassword){
                console.log('new password is not equal to re-type password');
                return res.redirect(`/new/password/verify?token=${verificationToken}`)
            }
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            const user = await User.findOneAndUpdate({ email: req.session.email },{password:hashedNewPassword}, {new:true});
            await UserToken.findByIdAndDelete(userToken._id);
            req.flash('message', 'Password change successfully.');
            res.redirect(`/login`);
        } else {
            console.log('Invalid or expired verification code.');
            const userLogin = await User.findById(req.session.login)
            return res.status(404).render('404', {
                login: req.session.login,
                userLogin: userLogin,
            });
        }
    } catch (error) {
        console.error('Verification failed:', error);
        return res.status(500).render('500');
    }
}